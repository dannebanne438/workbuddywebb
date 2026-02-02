import { MessageSquare, Calendar, ClipboardList, Book, Bell, MoreHorizontal } from "lucide-react";

type PortalView = "chat" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat";

interface MobileBottomNavProps {
  currentView: PortalView;
  onViewChange: (view: PortalView) => void;
  onOpenMore: () => void;
}

const mainNavItems = [
  { id: "chat" as const, label: "AI", icon: MessageSquare },
  { id: "schedule" as const, label: "Schema", icon: Calendar },
  { id: "checklists" as const, label: "Listor", icon: ClipboardList },
  { id: "routines" as const, label: "Rutiner", icon: Book },
  { id: "announcements" as const, label: "Nyheter", icon: Bell },
];

export function MobileBottomNav({ currentView, onViewChange, onOpenMore }: MobileBottomNavProps) {
  // Check if current view is in the "more" menu
  const isMoreActive = !mainNavItems.some(item => item.id === currentView);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? "text-primary" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* More button */}
        <button
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
            isMoreActive
              ? "text-primary"
              : "text-muted-foreground active:text-foreground"
          }`}
        >
          <MoreHorizontal className={`h-5 w-5 mb-1 ${isMoreActive ? "text-primary" : ""}`} />
          <span className={`text-[10px] font-medium ${isMoreActive ? "text-primary" : ""}`}>
            Mer
          </span>
        </button>
      </div>
    </nav>
  );
}
