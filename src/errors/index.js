export class AppError extends Error {
  constructor(message, statusCode, code, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

export class BusinessRuleError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'CONTABLE_VALIDATION_FAILED', errors);
  }
}

export class IdempotencyConflictError extends AppError {
  constructor(message = 'La transacción con la clave de idempotencia suministrada ya fue procesada previamente.') {
    super(message, 409, 'DUPLICATE_TRANSACTION_REJECTED');
  }
}
