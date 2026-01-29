import { useState, useEffect } from 'react';
import { loadProcedures } from '@/data/procedures';
import { Procedure } from '@/types/procedure';

export function useProcedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProcedures()
      .then(setProcedures)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { procedures, loading, error };
}
