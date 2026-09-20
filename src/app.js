import express from 'express';
import transactionRoutes from './routes/transaction.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { config } from './config/index.js';

export const app = express();

// Zero-Trust: deshabilitar encabezados que revelan tecnología del servidor
app.disable('x-powered-by');

// Middleware para parseo de payloads JSON con límite de tamaño
app.use(express.json({ limit: '1mb' }));

// Middleware de seguridad básico
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Ruta de diagnóstico / healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    empresa: config.empresa.nombre,
    timestamp: new Date().toISOString()
  });
});

// Rutas de negocio
app.use('/api/v1/transacciones', transactionRoutes);

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    type: 'https://api.sintecol.com/errors/not-found',
    title: 'Recurso No Encontrado',
    status: 404,
    detail: `La ruta ${req.originalUrl} no existe en este servidor.`,
    instance: req.originalUrl,
    code: 'RESOURCE_NOT_FOUND'
  });
});

// Manejador centralizado de errores
app.use(errorHandler);
