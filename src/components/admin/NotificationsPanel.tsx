import { useState } from 'react';
import { Bell, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'playground' | 'user';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'playground',
      title: 'Nouveau parc ajouté',
      message: 'Parc des Enfants - Lyon 6e',
      date: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'user',
      title: 'Nouvel utilisateur',
      message: 'marie@example.com s\'est inscrit',
      date: new Date().toISOString(),
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(current =>
      current.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(current =>
      current.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-background' : 'bg-accent/10'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {notification.type === 'playground' ? (
                    <MapPin className="h-5 w-5 text-secondary" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}