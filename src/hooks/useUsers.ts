import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserBasic {
  id: string;
  name: string;
  email: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name');

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, refetch: fetchUsers };
}
