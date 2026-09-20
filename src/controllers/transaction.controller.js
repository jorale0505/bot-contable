import { validateTransactionPayload } from '../validators/transaction.validator.js';
import { transactionService } from '../services/transaction.service.js';

export class TransactionController {
  constructor(service = transactionService) {
    this.service = service;
  }

  registrar = async (req, res, next) => {
    try {
      // 1. Zero-Trust Security: Validación estricta antes de invocar la capa de servicio
      const validation = validateTransactionPayload(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          type: 'https://api.sintecol.com/errors/validation-error',
          title: 'Error de Validación de Datos Contables',
          status: 400,
          detail: 'El payload contiene uno o más campos inválidos o contrarios a las normas contables.',
          instance: req.originalUrl,
          code: 'CONTABLE_VALIDATION_FAILED',
          errors: validation.errors
        });
      }

      // 2. Extracción de encabezados de idempotencia
      const idempotencyKey = req.header('x-idempotency-key') || null;

      // 3. Delegación a la capa de lógica de negocio (SoC)
      const resultado = await this.service.registrarTransaccion(req.body, idempotencyKey);

      return res.status(201).json({
        status: 'success',
        data: resultado
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const transactionController = new TransactionController();
