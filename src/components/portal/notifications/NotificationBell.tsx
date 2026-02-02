import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  onNavigate?: (view: string) => void;
  collapsed?: boolean;
}

export function NotificationBell({ onNavigate, collapsed = false }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleNavigate = (link: string) => {
    setOpen(false);
    onNavigate?.(link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className="relative"
          title="Notiser"
        >
          <Bell className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Notiser</span>}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <NotificationDropdown onNavigate={handleNavigate} />
      </PopoverContent>
    </Popover>
  );
}
