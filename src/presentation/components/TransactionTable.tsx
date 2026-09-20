import React from 'react';
import { TransaccionResponseData } from '../../domain/types/transaccion';

interface TransactionTableProps {
  transacciones: TransaccionResponseData[];
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

export const TransactionTable: React.FC<TransactionTableProps> = ({ transacciones }) => {
  return (
    <div className="table-wrapper card">
      <div className="table-header-bar">
        <h2 className="table-title">Registro de Transacciones y Comprobantes</h2>
        <span className="table-tag">Catálogo PUC Auxiliar</span>
      </div>
      <div className="table-responsive">
        <table className="accounting-table">
          <thead>
            <tr>
              <th>Comprobante</th>
              <th>Fecha</th>
              <th>NIT / Tercero</th>
              <th>Cuenta PUC</th>
              <th>Naturaleza</th>
              <th className="text-right">Monto (COP)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((tx) => (
              <tr key={tx.id}>
                <td className="font-mono font-bold">{tx.numero_comprobante}</td>
                <td>{new Date(tx.fecha).toLocaleDateString('es-CO')}</td>
                <td>
                  <div className="tercero-cell">
                    <span className="tercero-nombre">{tx.tercero_razon_social}</span>
                    <span className="tercero-nit">NIT: {tx.nit}</span>
                  </div>
                </td>
                <td>
                  <div className="cuenta-cell">
                    <span className="cuenta-codigo font-mono">{tx.cuenta}</span>
                    <span className="cuenta-nombre">{tx.cuenta_nombre}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge-tipo ${tx.tipo === 'DEBITO' ? 'badge-debito' : 'badge-credito'}`}>
                    {tx.tipo}
                  </span>
                </td>
                <td className="text-right font-mono font-bold">
                  {formatearMonedaCOP(tx.monto)}
                </td>
                <td>
                  <span className="badge-estado">{tx.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
