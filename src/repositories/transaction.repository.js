import crypto from 'node:crypto';

export class TransactionRepository {
  constructor() {
    this.cuentas = new Map([
      ['513505', { id: crypto.randomUUID(), codigo: '513505', nombre: 'Servicios de Aseo y Cafetería', naturaleza: 'DEBITO', permite_movimiento: true }],
      ['110505', { id: crypto.randomUUID(), codigo: '110505', nombre: 'Caja General', naturaleza: 'DEBITO', permite_movimiento: true }],
      ['111005', { id: crypto.randomUUID(), codigo: '111005', nombre: 'Bancos Moneda Nacional', naturaleza: 'DEBITO', permite_movimiento: true }],
      ['220505', { id: crypto.randomUUID(), codigo: '220505', nombre: 'Proveedores Nacionales', naturaleza: 'CREDITO', permite_movimiento: true }],
      ['413505', { id: crypto.randomUUID(), codigo: '413505', nombre: 'Comercio al por mayor y al por menor', naturaleza: 'CREDITO', permite_movimiento: true }],
      ['51', { id: crypto.randomUUID(), codigo: '51', nombre: 'Operacionales de Administración', naturaleza: 'DEBITO', permite_movimiento: false }]
    ]);

    this.terceros = new Map([
      ['900123456-8', { id: crypto.randomUUID(), nit: '900123456-8', razon_social: 'PROVEEDOR EJEMPLO S.A.S.', activo: true }]
    ]);

    this.transacciones = new Map();
    this.idempotencyKeys = new Map();
    this.secuenciaComprobante = 412;
  }

  async findAccountByCode(codigo) {
    return this.cuentas.get(String(codigo)) || null;
  }

  async findTerceroByNit(nit) {
    return this.terceros.get(String(nit)) || null;
  }

  async saveTercero(terceroData) {
    const id = crypto.randomUUID();
    const entity = { id, ...terceroData, activo: true, created_at: new Date().toISOString() };
    this.terceros.set(entity.nit, entity);
    return entity;
  }

  async findByIdempotencyKey(key) {
    const txId = this.idempotencyKeys.get(key);
    return txId ? this.transacciones.get(txId) : null;
  }

  async getNextVoucherNumber(anio = new Date().getFullYear()) {
    this.secuenciaComprobante += 1;
    const consecutivo = String(this.secuenciaComprobante).padStart(6, '0');
    return `COM-${anio}-${consecutivo}`;
  }

  async save(transaccionData, idempotencyKey = null) {
    const id = crypto.randomUUID();
    const entity = {
      id,
      ...transaccionData,
      created_at: new Date().toISOString()
    };

    this.transacciones.set(id, entity);
    if (idempotencyKey) {
      this.idempotencyKeys.set(idempotencyKey, id);
    }
    return entity;
  }

  async findById(id) {
    return this.transacciones.get(id) || null;
  }
}

export const transactionRepository = new TransactionRepository();
