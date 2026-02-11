import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { OpmeItem } from '@/types/package';

async function fetchOpmes(userId: string) {
  const { data, error } = await supabase
    .from('opmes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? undefined,
    value: item.value ?? 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  })) as OpmeItem[];
}

export function useOpmes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['opmes', user?.id];

  const { data, isLoading } = useQuery<OpmeItem[]>({
    queryKey,
    queryFn: () => fetchOpmes(user!.id),
    enabled: Boolean(user?.id),
  });

  const addMutation = useMutation({
    mutationFn: async (payload: Omit<OpmeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: opmeData, error } = await supabase
        .from('opmes')
        .insert([
          {
            user_id: user!.id,
            name: payload.name,
            description: payload.description ?? null,
            value: payload.value ?? 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: opmeData.id,
        name: opmeData.name,
        description: opmeData.description ?? payload.description ?? undefined,
        value: opmeData.value ?? payload.value ?? 0,
        createdAt: opmeData.created_at,
        updatedAt: opmeData.updated_at,
      } as OpmeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<OpmeItem, 'id' | 'createdAt'>> }) => {
      const updateData: { name?: string; description?: string | null; value?: number; updated_at: string } = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description ?? null;
      if (data.value !== undefined) updateData.value = data.value;

      const { error } = await supabase
        .from('opmes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('opmes')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addOpme = useCallback(
    async (payload: Omit<OpmeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) return null;
      return addMutation.mutateAsync(payload);
    },
    [addMutation, user?.id]
  );

  const updateOpme = useCallback(
    async (id: string, data: Partial<Omit<OpmeItem, 'id' | 'createdAt'>>) => {
      if (!user?.id) return;
      await updateMutation.mutateAsync({ id, data });
    },
    [updateMutation, user?.id]
  );

  const deleteOpme = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation, user?.id]
  );

  return {
    opmes: data || [],
    loading: isLoading,
    addOpme,
    updateOpme,
    deleteOpme,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
