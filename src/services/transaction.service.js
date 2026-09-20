import { transactionRepository } from '../repositories/transaction.repository.js';
import { BusinessRuleError, IdempotencyConflictError } from '../errors/index.js';
import { config } from '../config/index.js';

export class TransactionService {
  constructor(repository = transactionRepository) {
    this.repository = repository;
  }

  async registrarTransaccion(payload, idempotencyKey = null) {
    if (idempotencyKey) {
      const existing = await this.repository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        throw new IdempotencyConflictError();
      }
    }

    const cuenta = await this.repository.findAccountByCode(payload.cuenta);
    if (!cuenta) {
      throw new BusinessRuleError('Validación de catálogo contable fallida.', [
        { field: 'cuenta', rejected_value: payload.cuenta, message: 'La cuenta contable no existe en el catálogo PUC activo.' }
      ]);
    }

    if (!cuenta.permite_movimiento) {
      throw new BusinessRuleError('La cuenta contable seleccionada no permite imputación directa.', [
        { field: 'cuenta', rejected_value: payload.cuenta, message: 'La cuenta contable es de nivel superior y no admite movimientos auxiliares.' }
      ]);
    }

    let tercero = await this.repository.findTerceroByNit(payload.nit);
    if (!tercero) {
      tercero = await this.repository.saveTercero({
        nit: payload.nit,
        razon_social: `TERCERO CONTABLE NIT ${payload.nit}`
      });
    }

    const anio = new Date(payload.fecha).getFullYear();
    const numeroComprobante = await this.repository.getNextVoucherNumber(anio);

    const nuevaTransaccion = await this.repository.save({
      numero_comprobante: numeroComprobante,
      monto: Number(payload.monto).toFixed(2),
      tipo: payload.tipo,
      nit: payload.nit,
      tercero_id: tercero.id,
      tercero_razon_social: tercero.razon_social,
      cuenta: cuenta.codigo,
      cuenta_id: cuenta.id,
      cuenta_nombre: cuenta.nombre,
      fecha: payload.fecha,
      descripcion: payload.descripcion || null,
      origen_evento_id: payload.origen_evento_id || null,
      estado: 'CLASIFICADO_PENDIENTE_APROBACION',
      idempotency_key: idempotencyKey,
      empresa: config.empresa.nombre
    }, idempotencyKey);

    return {
      id: nuevaTransaccion.id,
      numero_comprobante: nuevaTransaccion.numero_comprobante,
      monto: nuevaTransaccion.monto,
      tipo: nuevaTransaccion.tipo,
      nit: nuevaTransaccion.nit,
      tercero_razon_social: nuevaTransaccion.tercero_razon_social,
      cuenta: nuevaTransaccion.cuenta,
      cuenta_nombre: nuevaTransaccion.cuenta_nombre,
      fecha: nuevaTransaccion.fecha,
      estado: nuevaTransaccion.estado,
      origen_evento_id: nuevaTransaccion.origen_evento_id,
      idempotency_key: nuevaTransaccion.idempotency_key,
      created_at: nuevaTransaccion.created_at,
      empresa: config.empresa.nombre
    };
  }
}

export const transactionService = new TransactionService();
