import React from 'react';
import { useTransacciones } from '../hooks/useTransacciones';
import { Header } from '../components/Header';
import { MetricCards } from '../components/MetricCards';
import { TransactionTable } from '../components/TransactionTable';

export const DashboardView: React.FC = () => {
  const { transacciones, metricas, isLoading, error, recargar } = useTransacciones();

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="dashboard-content">
        <div className="dashboard-action-bar">
          <div>
            <h2 className="section-title">Consola de Movimientos Contables</h2>
            <p className="section-subtitle">
              Auditoría y conciliación de comprobantes en tiempo real
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => recargar()}
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Recargar Mocks'}
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error de Sistema:</strong> {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando datos contables...</p>
          </div>
        ) : (
          <>
            <MetricCards metricas={metricas} />
            <TransactionTable transacciones={transacciones} />
          </>
        )}
      </main>
    </div>
  );
};
