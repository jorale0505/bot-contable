import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { validateTransactionPayload } from '../src/validators/transaction.validator.js';
import { TransactionService } from '../src/services/transaction.service.js';
import { TransactionController } from '../src/controllers/transaction.controller.js';
import { TransactionRepository } from '../src/repositories/transaction.repository.js';
import { app } from '../src/app.js';

describe('1. Validación de Entrada (Zero-Trust Validator)', () => {
  test('Debe fallar si faltan campos obligatorios (ej: monto, nit, cuenta)', () => {
    const payloadIncompleto = {
      tipo: 'DEBITO',
      fecha: '2026-09-19T23:30:00Z'
    };
    const res = validateTransactionPayload(payloadIncompleto);
    assert.equal(res.isValid, false);
    const camposFallidos = res.errors.map(e => e.field);
    assert.ok(camposFallidos.includes('monto'));
    assert.ok(camposFallidos.includes('nit'));
    assert.ok(camposFallidos.includes('cuenta'));
  });

  test('Debe rechazar monto no decimal o menor o igual a cero', () => {
    const res = validateTransactionPayload({
      monto: '-50.00',
      tipo: 'DEBITO',
      nit: '900123456-8',
      cuenta: '513505',
      fecha: '2026-09-19T23:30:00Z'
    });
    assert.equal(res.isValid, false);
    assert.equal(res.errors[0].field, 'monto');
  });

  test('Debe validar el dígito de verificación DIAN (Módulo 11)', () => {
    // 900123456 tiene DV = 8
    const resInvalido = validateTransactionPayload({
      monto: '150000.00',
      tipo: 'DEBITO',
      nit: '900123456-1', // DV incorrecto (debería ser 8)
      cuenta: '513505',
      fecha: '2026-09-19T23:30:00Z'
    });
    assert.equal(resInvalido.isValid, false);
    assert.match(resInvalido.errors[0].message, /Dígito de verificación inválido/);

    const resValido = validateTransactionPayload({
      monto: '150000.00',
      tipo: 'DEBITO',
      nit: '900123456-8', // DV correcto
      cuenta: '513505',
      fecha: '2026-09-19T23:30:00Z'
    });
    assert.equal(resValido.isValid, true);
  });
});

describe('2. Separación de Capas (SoC) y Capa de Negocio', () => {
  let mockRepo;
  let service;

  beforeEach(() => {
    mockRepo = new TransactionRepository();
    service = new TransactionService(mockRepo);
  });

  test('Debe registrar exitosamente una transacción con empresa SINTECOL S.A.S.', async () => {
    const resultado = await service.registrarTransaccion({
      monto: '250000.00',
      tipo: 'DEBITO',
      nit: '900123456-8',
      cuenta: '513505',
      fecha: '2026-09-19T23:30:00Z'
    }, 'key-idemp-1');

    assert.ok(resultado.id);
    assert.equal(resultado.monto, '250000.00');
    assert.equal(resultado.empresa, 'SINTECOL S.A.S.');
    assert.equal(resultado.cuenta_nombre, 'Servicios de Aseo y Cafetería');
    assert.match(resultado.numero_comprobante, /^COM-2026-\d{6}$/);
  });

  test('Debe rechazar reintentos con la misma clave de idempotencia (409 Conflict)', async () => {
    await service.registrarTransaccion({
      monto: '100000.00',
      tipo: 'CREDITO',
      nit: '900123456-8',
      cuenta: '110505',
      fecha: '2026-09-19T23:30:00Z'
    }, 'key-unica-123');

    await assert.rejects(async () => {
      await service.registrarTransaccion({
        monto: '100000.00',
        tipo: 'CREDITO',
        nit: '900123456-8',
        cuenta: '110505',
        fecha: '2026-09-19T23:30:00Z'
      }, 'key-unica-123');
    }, { statusCode: 409, code: 'DUPLICATE_TRANSACTION_REJECTED' });
  });

  test('Debe rechazar cuentas contables no existentes o que no admiten movimiento', async () => {
    await assert.rejects(async () => {
      await service.registrarTransaccion({
        monto: '100000.00',
        tipo: 'DEBITO',
        nit: '900123456-8',
        cuenta: '999999', // Inexistente
        fecha: '2026-09-19T23:30:00Z'
      });
    }, { statusCode: 400, code: 'CONTABLE_VALIDATION_FAILED' });

    await assert.rejects(async () => {
      await service.registrarTransaccion({
        monto: '100000.00',
        tipo: 'DEBITO',
        nit: '900123456-8',
        cuenta: '51', // Mayor, no auxiliar
        fecha: '2026-09-19T23:30:00Z'
      });
    }, { statusCode: 400, code: 'CONTABLE_VALIDATION_FAILED' });
  });
});

describe('3. Controlador HTTP y Zero-Trust Guard', () => {
  test('El controlador debe abortar con 400 antes de llamar al servicio si falta un campo', async () => {
    let servicioInvocado = false;
    const mockService = {
      registrarTransaccion: async () => {
        servicioInvocado = true;
      }
    };

    const controller = new TransactionController(mockService);

    let statusEnviado = null;
    let jsonEnviado = null;
    const req = {
      body: { monto: '100.00' }, // faltan nit, cuenta, tipo, fecha
      originalUrl: '/api/v1/transacciones',
      header: () => null
    };
    const res = {
      status: (code) => {
        statusEnviado = code;
        return {
          json: (data) => {
            jsonEnviado = data;
          }
        };
      }
    };

    await controller.registrar(req, res, () => {});

    assert.equal(statusEnviado, 400);
    assert.equal(servicioInvocado, false);
    assert.equal(jsonEnviado.code, 'CONTABLE_VALIDATION_FAILED');
  });
});
