import { useQuery } from '@tanstack/react-query';
import { loadProcedures } from '@/data/procedures';
import { Procedure } from '@/types/procedure';

export function useProcedures() {
  const { data, isLoading, error } = useQuery<Procedure[]>({
    queryKey: ['procedures'],
    queryFn: loadProcedures,
    staleTime: 1000 * 60 * 60,
  });

  return {
    procedures: Array.isArray(data) ? data : [],
    loading: isLoading,
    error: error instanceof Error ? error : null,
  };
}
