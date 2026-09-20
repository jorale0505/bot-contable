export type TipoMovimiento = 'DEBITO' | 'CREDITO';

export type EstadoTransaccion =
  | 'CLASIFICADO_PENDIENTE_APROBACION'
  | 'BORRADOR'
  | 'APROBADO'
  | 'ANULADO';

export interface RegistroTransaccionRequest {
  monto: string;
  tipo: TipoMovimiento;
  nit: string;
  cuenta: string;
  fecha: string;
  descripcion?: string;
  origen_evento_id?: string;
}

export interface TransaccionResponseData {
  id: string;
  numero_comprobante: string;
  monto: string;
  tipo: TipoMovimiento;
  nit: string;
  tercero_razon_social: string;
  cuenta: string;
  cuenta_nombre: string;
  fecha: string;
  estado: EstadoTransaccion | string;
  origen_evento_id: string;
  idempotency_key: string;
  created_at: string;
  empresa: 'SINTECOL S.A.S.';
}

export interface TransaccionApiResponse {
  status: 'success';
  data: TransaccionResponseData;
}

export interface ResumenMetricasDashboard {
  empresa: 'SINTECOL S.A.S.';
  total_debitos: string;
  total_creditos: string;
  diferencia_balance: string;
  total_transacciones: number;
}
