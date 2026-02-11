import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserBasic {
  id: string;
  name: string;
  email: string;
}

async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .order('name');

  if (error) throw error;

  const uniqueUsers = data
    ? data.filter((u, index, self) => index === self.findIndex((t) => t.id === u.id))
    : [];

  return uniqueUsers as UserBasic[];
}

export function useUsers() {
  const queryClient = useQueryClient();
  const queryKey = ['users'];

  const { data, isLoading } = useQuery<UserBasic[]>({
    queryKey,
    queryFn: fetchUsers,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  return { users: data || [], loading: isLoading, refetch };
}
