import { useState, useEffect } from 'react';
import { loadProcedures } from '@/data/procedures';
import { Procedure } from '@/types/procedure';

export function useProcedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadProcedures();
        setProcedures(Array.isArray(data) ? data : []);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load procedures');
        console.error('Error in useProcedures:', error);
        setError(error);
        setProcedures([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { procedures, loading, error };
}
