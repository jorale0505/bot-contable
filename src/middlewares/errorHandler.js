import crypto from 'node:crypto';
import { AppError } from '../errors/index.js';

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      type: `https://api.sintecol.com/errors/${err.code.toLowerCase().replace(/_/g, '-')}`,
      title: err.name === 'IdempotencyConflictError' ? 'Transacción Duplicada' : 'Error de Validación de Datos Contables',
      status: err.statusCode,
      detail: err.message,
      instance: req.originalUrl,
      code: err.code,
      ...(err.errors && err.errors.length > 0 ? { errors: err.errors } : {})
    });
  }

  const trackingId = crypto.randomUUID();
  console.error(`[INTERNAL_ERROR][tracking_id: ${trackingId}]`, err);

  return res.status(500).json({
    type: 'https://api.sintecol.com/errors/internal-server-error',
    title: 'Error Interno del Servicio',
    status: 500,
    detail: 'Ha ocurrido un error inesperado al procesar el registro contable. Contacte al administrador con el tracking_id.',
    instance: req.originalUrl,
    code: 'INTERNAL_SERVER_ERROR',
    tracking_id: trackingId
  });
}
