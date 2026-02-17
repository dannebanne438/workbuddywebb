import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { isFeatureEnabled } from "@/lib/features";
import { Sparkles, Calendar, ClipboardList, LayoutDashboard, AlertTriangle, MoreHorizontal } from "lucide-react";

type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents" | "documents" | "photos";

interface MobileBottomNavProps {
  currentView: PortalView;
  onViewChange: (view: PortalView) => void;
  onOpenMore: () => void;
}

const mainNavItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "camera" as const, label: "WorkBuddy", icon: Sparkles },
  { id: "schedule" as const, label: "Schema", icon: Calendar },
  { id: "checklists" as const, label: "Listor", icon: ClipboardList },
  { id: "incidents" as const, label: "Avvikelser", icon: AlertTriangle },
];

export function MobileBottomNav({ currentView, onViewChange, onOpenMore }: MobileBottomNavProps) {
  const { isSuperAdmin } = useAuth();
  const { activeWorkplace } = useWorkplace();

  const filteredItems = mainNavItems.filter((item) =>
    isFeatureEnabled(item.id, activeWorkplace?.settings as Record<string, unknown> | null, isSuperAdmin)
  );

  // Check if current view is in the "more" menu
  const isMoreActive = !filteredItems.some(item => item.id === currentView);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {filteredItems.map((item) => {
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
