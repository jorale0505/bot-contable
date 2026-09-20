const DIAN_WEIGHTS = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];

export function calcularDigitoVerificacion(nitSinDv) {
  const cleanNit = nitSinDv.replace(/[^0-9]/g, '');
  const len = cleanNit.length;
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const digit = parseInt(cleanNit[len - 1 - i], 10);
    const weight = DIAN_WEIGHTS[DIAN_WEIGHTS.length - 1 - i];
    sum += digit * weight;
  }
  const residuo = sum % 11;
  return residuo > 1 ? (11 - residuo).toString() : residuo.toString();
}

export function validateTransactionPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      isValid: false,
      errors: [{ field: 'body', rejected_value: null, message: 'El cuerpo de la petición debe ser un objeto JSON.' }]
    };
  }

  const { monto, tipo, nit, cuenta, fecha, descripcion, origen_evento_id } = payload;

  // 1. Monto
  if (monto === undefined || monto === null || monto === '') {
    errors.push({ field: 'monto', rejected_value: monto, message: 'El campo monto es obligatorio.' });
  } else if (!/^[0-9]+(\.[0-9]{2})?$/.test(String(monto)) || parseFloat(monto) <= 0) {
    errors.push({ field: 'monto', rejected_value: monto, message: 'Formato de monto inválido. Debe ser decimal estricto > 0 (ej: 150000.00).' });
  }

  // 2. Tipo
  if (!tipo) {
    errors.push({ field: 'tipo', rejected_value: tipo, message: 'El campo tipo es obligatorio.' });
  } else if (!['DEBITO', 'CREDITO'].includes(tipo)) {
    errors.push({ field: 'tipo', rejected_value: tipo, message: 'El tipo debe ser DEBITO o CREDITO.' });
  }

  // 3. NIT
  if (!nit) {
    errors.push({ field: 'nit', rejected_value: nit, message: 'El campo nit es obligatorio.' });
  } else if (!/^[0-9]{8,10}(-[0-9kK])?$/.test(String(nit))) {
    errors.push({ field: 'nit', rejected_value: nit, message: 'Formato de NIT inválido. Debe contener entre 8 y 10 dígitos (ej: 900123456-1).' });
  } else if (String(nit).includes('-')) {
    const [nitBase, dvSupplied] = String(nit).split('-');
    const expectedDv = calcularDigitoVerificacion(nitBase);
    if (dvSupplied.toUpperCase() !== expectedDv) {
      errors.push({ field: 'nit', rejected_value: nit, message: `Dígito de verificación inválido. Calculado: ${expectedDv}.` });
    }
  }

  // 4. Cuenta
  if (!cuenta) {
    errors.push({ field: 'cuenta', rejected_value: cuenta, message: 'El campo cuenta es obligatorio.' });
  } else if (!/^[1-9][0-9]{3,9}$/.test(String(cuenta))) {
    errors.push({ field: 'cuenta', rejected_value: cuenta, message: 'El código de cuenta PUC debe contener entre 4 y 10 dígitos numéricos.' });
  }

  // 5. Fecha
  if (!fecha) {
    errors.push({ field: 'fecha', rejected_value: fecha, message: 'El campo fecha es obligatorio.' });
  } else {
    const dateTimestamp = Date.parse(fecha);
    if (Number.isNaN(dateTimestamp)) {
      errors.push({ field: 'fecha', rejected_value: fecha, message: 'La fecha debe tener un formato ISO 8601 válido (ej: 2026-09-19T23:30:00Z).' });
    } else if (dateTimestamp > Date.now() + 5 * 60 * 1000) {
      errors.push({ field: 'fecha', rejected_value: fecha, message: 'La fecha de la transacción no puede ser futura.' });
    }
  }

  // Campos opcionales
  if (descripcion && (typeof descripcion !== 'string' || descripcion.length < 3 || descripcion.length > 255)) {
    errors.push({ field: 'descripcion', rejected_value: descripcion, message: 'La descripción debe tener entre 3 y 255 caracteres.' });
  }

  if (origen_evento_id && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(origen_evento_id)) {
    errors.push({ field: 'origen_evento_id', rejected_value: origen_evento_id, message: 'El origen_evento_id debe ser un UUID válido.' });
  }

  return { isValid: errors.length === 0, errors };
}
