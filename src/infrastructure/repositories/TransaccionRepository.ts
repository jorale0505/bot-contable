import {
  TransaccionResponseData,
  ResumenMetricasDashboard,
} from '../../domain/types/transaccion';

export interface ITransaccionRepository {
  listarTransacciones(): Promise<TransaccionResponseData[]>;
  obtenerResumen(): Promise<ResumenMetricasDashboard>;
}

const MOCK_TRANSACCIONES: TransaccionResponseData[] = [
  {
    id: 'e8b62bf2-4161-482a-a9e3-2e0fbb38a101',
    numero_comprobante: 'COM-2026-000412',
    monto: '1500000.00',
    tipo: 'DEBITO',
    nit: '900123456-1',
    tercero_razon_social: 'PROVEEDOR EJEMPLO S.A.S.',
    cuenta: '513505',
    cuenta_nombre: 'Servicios de Aseo y Cafetería',
    fecha: '2026-09-19T23:30:00Z',
    estado: 'CLASIFICADO_PENDIENTE_APROBACION',
    origen_evento_id: '8fa81699-2a74-4b53-a75d-5953049195d2',
    idempotency_key: 'c1f6b8df-5949-4eb5-8e10-928e1dc4a67b',
    created_at: '2026-09-19T23:31:00Z',
    empresa: 'SINTECOL S.A.S.',
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    numero_comprobante: 'COM-2026-000413',
    monto: '1500000.00',
    tipo: 'CREDITO',
    nit: '900123456-1',
    tercero_razon_social: 'PROVEEDOR EJEMPLO S.A.S.',
    cuenta: '233595',
    cuenta_nombre: 'Otras Cuentas por Pagar',
    fecha: '2026-09-19T23:32:00Z',
    estado: 'APROBADO',
    origen_evento_id: '8fa81699-2a74-4b53-a75d-5953049195d3',
    idempotency_key: 'd2e7c9e0-6050-4fc6-9f21-039f2ed5b78c',
    created_at: '2026-09-19T23:33:00Z',
    empresa: 'SINTECOL S.A.S.',
  },
  {
    id: 'c9a8b7c6-d5e4-4f3a-2b1c-0d9e8f7a6b5c',
    numero_comprobante: 'COM-2026-000414',
    monto: '4850200.00',
    tipo: 'DEBITO',
    nit: '860012345-4',
    tercero_razon_social: 'DISTRIBUIDORA NACIONAL S.A.',
    cuenta: '143505',
    cuenta_nombre: 'Mercancías no Fabricadas por la Empresa',
    fecha: '2026-09-19T22:15:00Z',
    estado: 'BORRADOR',
    origen_evento_id: '7eb82588-1b63-4a42-964c-4842f38084c1',
    idempotency_key: 'b3f5a7d9-4838-4da4-7d09-817d0cb3a56a',
    created_at: '2026-09-19T22:16:00Z',
    empresa: 'SINTECOL S.A.S.',
  },
];

export class MockTransaccionRepository implements ITransaccionRepository {
  async listarTransacciones(): Promise<TransaccionResponseData[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_TRANSACCIONES]), 150);
    });
  }

  async obtenerResumen(): Promise<ResumenMetricasDashboard> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          empresa: 'SINTECOL S.A.S.',
          total_debitos: '6350200.00',
          total_creditos: '1500000.00',
          diferencia_balance: '4850200.00',
          total_transacciones: MOCK_TRANSACCIONES.length,
        });
      }, 150);
    });
  }
}
