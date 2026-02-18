import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationsModalProps {
  open: boolean;
  notifications: Notification[];
  onClose: () => void;
  onAccept: (notificationId: string, data: Notification['data']) => void;
  onReject: (notificationId: string, data: Notification['data']) => void;
}

export function NotificationsModal({
  open,
  notifications,
  onClose,
  onAccept,
  onReject,
}: NotificationsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="sticky top-0 bg-card border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notificações</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma notificação
            </p>
          ) : (
            notifications.map((notification) => {
              if (notification.type !== 'package_share') return null;
              return (
                <Card key={notification.id} className={notification.read ? 'bg-muted/30' : 'border-primary'}>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {notification.data.from_user_name} compartilhou um{' '}
                        {notification.data.package_type === 'private' ? 'pacote particular' : 'pacote'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.data.package_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => onAccept(notification.id, notification.data)}
                      >
                        <Check className="h-4 w-4" />
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onReject(notification.id, notification.data)}
                      >
                        Recusar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
