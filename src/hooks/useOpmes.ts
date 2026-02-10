import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { OpmeItem } from '@/types/package';

export function useOpmes() {
  const { user, loading: authLoading } = useAuth();
  const [opmes, setOpmes] = useState<OpmeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOpmes = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opmes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar OPMEs:', error);
        return;
      }

      const mapped = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? undefined,
        value: item.value ?? 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setOpmes(mapped);
    } catch (error) {
      console.error('Erro ao carregar OPMEs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading || !user?.id) return;
    fetchOpmes();
  }, [fetchOpmes, authLoading, user?.id]);

  const addOpme = useCallback(
    async (data: Omit<OpmeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) return null;

      try {
        const { data: opmeData, error } = await supabase
          .from('opmes')
          .insert([
            {
              user_id: user.id,
              name: data.name,
              description: data.description ?? null,
              value: data.value ?? 0,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar OPME:', error);
          throw error;
        }

        const newOpme: OpmeItem = {
          id: opmeData.id,
          name: opmeData.name,
          description: opmeData.description ?? data.description ?? undefined,
          value: opmeData.value ?? data.value ?? 0,
          createdAt: opmeData.created_at,
          updatedAt: opmeData.updated_at,
        };

        setOpmes((prev) => [newOpme, ...prev]);
        return newOpme;
      } catch (error) {
        console.error('Erro ao criar OPME:', error);
        throw error;
      }
    },
    [user?.id]
  );

  const updateOpme = useCallback(
    async (id: string, data: Partial<Omit<OpmeItem, 'id' | 'createdAt'>>) => {
      if (!user?.id) return;

      try {
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
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao atualizar OPME:', error);
          throw error;
        }

        setOpmes((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...(data.name !== undefined ? { name: data.name } : {}),
                  ...(data.description !== undefined ? { description: data.description ?? undefined } : {}),
                  ...(data.value !== undefined ? { value: data.value } : {}),
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
      } catch (error) {
        console.error('Erro ao atualizar OPME:', error);
        throw error;
      }
    },
    [user?.id]
  );

  const deleteOpme = useCallback(
    async (id: string) => {
      if (!user?.id) return;

      try {
        const { error } = await supabase
          .from('opmes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao deletar OPME:', error);
          return;
        }

        setOpmes((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Erro ao deletar OPME:', error);
      }
    },
    [user?.id]
  );

  return {
    opmes,
    loading,
    addOpme,
    updateOpme,
    deleteOpme,
    refetch: fetchOpmes,
  };
}
