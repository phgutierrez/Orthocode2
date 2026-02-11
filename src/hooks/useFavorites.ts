import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

async function fetchFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('procedure_code')
    .eq('user_id', userId);

  if (error) throw error;
  return data?.map((f) => f.procedure_code) || [];
}

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['favorites', user?.id];

  const { data, isLoading } = useQuery<string[]>({
    queryKey,
    queryFn: () => fetchFavorites(user!.id),
    enabled: Boolean(user?.id),
  });

  const addMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user!.id, procedure_code: id }]);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<string[]>(queryKey, (prev) => {
        const current = prev || [];
        return current.includes(id) ? current : [...current, id];
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user!.id)
        .eq('procedure_code', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<string[]>(queryKey, (prev) => (prev || []).filter((fav) => fav !== id));
    },
  });

  const favorites = data || [];

  const addFavorite = useCallback(
    async (id: string) => {
      if (!user?.id || favorites.includes(id)) return;
      await addMutation.mutateAsync(id);
    },
    [addMutation, favorites, user?.id]
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await removeMutation.mutateAsync(id);
    },
    [removeMutation, user?.id]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      if (favorites.includes(id)) {
        void removeFavorite(id);
      } else {
        void addFavorite(id);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    loading: isLoading,
  };
}
