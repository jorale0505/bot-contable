import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="corporate-header">
      <div className="header-container">
        <div className="brand-badge">
          <span className="brand-dot"></span>
          <h1 className="corporate-title">SINTECOL S.A.S.</h1>
          <span className="brand-separator">|</span>
          <span className="brand-subtitle">Core Contable & Bot de Clasificación</span>
        </div>
        <div className="header-meta">
          <span className="system-status">Estado: En línea</span>
          <span className="badge-env">Entorno Seguro</span>
        </div>
      </div>
    </header>
  );
};
