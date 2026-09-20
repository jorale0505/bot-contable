import { useState, useEffect, useCallback } from 'react';
import {
  TransaccionResponseData,
  ResumenMetricasDashboard,
} from '../../domain/types/transaccion';
import {
  ITransaccionRepository,
  MockTransaccionRepository,
} from '../../infrastructure/repositories/TransaccionRepository';

const defaultRepository: ITransaccionRepository = new MockTransaccionRepository();

export function useTransacciones(repository: ITransaccionRepository = defaultRepository) {
  const [transacciones, setTransacciones] = useState<TransaccionResponseData[]>([]);
  const [metricas, setMetricas] = useState<ResumenMetricasDashboard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [items, resumen] = await Promise.all([
        repository.listarTransacciones(),
        repository.obtenerResumen(),
      ]);
      setTransacciones(items);
      setMetricas(resumen);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar transacciones');
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    transacciones,
    metricas,
    isLoading,
    error,
    recargar: cargarDatos,
  };
}
