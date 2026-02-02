import { Bell, Check, Trash2, MessageSquare, Calendar, Users, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  onNavigate?: (view: string) => void;
}

const typeIcons: Record<Notification["type"], React.ElementType> = {
  announcement: Megaphone,
  dm: MessageSquare,
  schedule_change: Calendar,
  team_message: Users,
};

const typeColors: Record<Notification["type"], string> = {
  announcement: "text-primary",
  dm: "text-blue-500",
  schedule_change: "text-orange-500",
  team_message: "text-green-500",
};

export function NotificationDropdown({ onNavigate }: NotificationDropdownProps) {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, unreadCount } =
    useNotifications();

  const handleClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      onNavigate?.(notification.link);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Notiser</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
            <Check className="h-3 w-3 mr-1" />
            Markera alla
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Inga notiser</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              const iconColor = typeColors[notification.type];

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-accent/50 cursor-pointer transition-colors relative group",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => handleClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={cn("h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0", iconColor)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", !notification.is_read && "text-foreground")}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: sv,
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
