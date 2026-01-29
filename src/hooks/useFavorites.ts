import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useFavorites() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar favoritos do Supabase ao montar
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('favorites')
          .select('procedure_code')
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao carregar favoritos:', error);
          return;
        }

        setFavorites(data?.map(f => f.procedure_code) || []);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.id, authLoading]);

  const addFavorite = useCallback(async (id: string) => {
    if (!user?.id || favorites.includes(id)) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, procedure_code: id }]);

      if (error) {
        console.error('Erro ao adicionar favorito:', error);
        return;
      }

      setFavorites(prev => [...new Set([...prev, id])]);
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
    }
  }, [user?.id, favorites]);

  const removeFavorite = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('procedure_code', id);

      if (error) {
        console.error('Erro ao remover favorito:', error);
        return;
      }

      setFavorites(prev => prev.filter(fav => fav !== id));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  }, [user?.id]);

  const toggleFavorite = useCallback((id: string) => {
    if (favorites.includes(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((id: string) => {
    return favorites.includes(id);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    loading,
  };
}
