import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  data: any;
  read: boolean;
  createdAt: string;
}

async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type,
    data: n.data,
    read: n.read,
    createdAt: n.created_at,
  })) as Notification[];
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['notifications', user?.id];

  const { data, isLoading } = useQuery<Notification[]>({
    queryKey,
    queryFn: () => fetchNotifications(user!.id),
    enabled: Boolean(user?.id),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(queryKey, (prev) =>
        (prev || []).map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(queryKey, (prev) =>
        (prev || []).filter((n) => n.id !== id)
      );
    },
  });

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await markAsReadMutation.mutateAsync(id);
    },
    [markAsReadMutation, user?.id]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation, user?.id]
  );

  const notifications = data || [];
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return {
    notifications,
    loading: isLoading,
    unreadCount,
    markAsRead,
    deleteNotification,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
