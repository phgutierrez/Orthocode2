import { useCallback, useEffect, useState } from 'react';
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

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      const mapped = (data || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        data: n.data,
        read: n.read,
        createdAt: n.created_at,
      }));

      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, [user?.id]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar notificação:', error);
        return;
      }

      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }, [user?.id, notifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
