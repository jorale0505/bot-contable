import React from 'react';
import { ResumenMetricasDashboard } from '../../domain/types/transaccion';

interface MetricCardsProps {
  metricas: ResumenMetricasDashboard | null;
}

const formatearMonedaCOP = (valorStr: string) => {
  const numero = parseFloat(valorStr);
  if (isNaN(numero)) return '$ 0.00';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(numero);
};

export const MetricCards: React.FC<MetricCardsProps> = ({ metricas }) => {
  if (!metricas) return null;

  return (
    <div className="metrics-grid">
      <div className="card metric-card">
        <span className="metric-label">Total Débitos</span>
        <span className="metric-value debit">{formatearMonedaCOP(metricas.total_debitos)}</span>
        <span className="metric-footnote">Movimientos deudores imputados</span>
      </div>

      <div className="card metric-card">
        <span className="metric-label">Total Créditos</span>
        <span className="metric-value credit">{formatearMonedaCOP(metricas.total_creditos)}</span>
        <span className="metric-footnote">Movimientos acreedores imputados</span>
      </div>

      <div className="card metric-card">
        <span className="metric-label">Diferencia Balance</span>
        <span className="metric-value balance">{formatearMonedaCOP(metricas.diferencia_balance)}</span>
        <span className="metric-footnote">Partida doble en conciliación</span>
      </div>

      <div className="card metric-card">
        <span className="metric-label">Comprobantes Activos</span>
        <span className="metric-value count">{metricas.total_transacciones}</span>
        <span className="metric-footnote">Registros cargados</span>
      </div>
    </div>
  );
};
