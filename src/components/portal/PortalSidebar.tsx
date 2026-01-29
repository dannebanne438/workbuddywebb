import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Calendar,
  ClipboardList,
  Book,
  Bell,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Home,
  MessagesSquare,
} from "lucide-react";

type PortalView = "chat" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat";

interface PortalSidebarProps {
  currentView?: PortalView;
  onViewChange?: (view: PortalView) => void;
}

export function PortalSidebar({ currentView = "chat", onViewChange }: PortalSidebarProps) {
  const { profile, workplace, signOut, isSuperAdmin, isWorkplaceAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { id: "chat" as const, label: "WorkBuddy", icon: MessageSquare },
    { id: "team-chat" as const, label: "Teamchatt", icon: MessagesSquare },
    { id: "schedule" as const, label: "Schema", icon: Calendar },
    { id: "checklists" as const, label: "Checklistor", icon: ClipboardList },
    { id: "routines" as const, label: "Rutiner", icon: Book },
    { id: "announcements" as const, label: "Nyheter", icon: Bell },
  ];

  const adminItems = [
    { id: "employees" as const, label: "Personal", icon: Users, requiresAdmin: true },
    { id: "settings" as const, label: "Inställningar", icon: Settings, requiresAdmin: true },
  ];

  const superAdminItems = [
    { id: "admin" as const, label: "Super Admin", icon: Shield, requiresSuperAdmin: true },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-card border-r border-border flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg wb-gradient-accent flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">W</span>
            </div>
            <span className="font-semibold text-foreground">WorkBuddy</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Workplace Info */}
      {!collapsed && workplace && (
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Arbetsplats</p>
          <p className="font-medium text-foreground truncate">{workplace.name}</p>
          <p className="text-xs text-muted-foreground truncate">{workplace.company_name}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}

        {isWorkplaceAdmin && (
          <>
            <div className="py-2">
              <div className={`h-px bg-border ${collapsed ? "mx-2" : ""}`} />
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange?.(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </>
        )}

        {isSuperAdmin && (
          <>
            <div className="py-2">
              <div className={`h-px bg-border ${collapsed ? "mx-2" : ""}`} />
            </div>
            {superAdminItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange?.(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        {!collapsed && profile && (
          <div className="mb-3">
            <p className="font-medium text-foreground truncate text-sm">{profile.full_name || profile.email}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="flex-1"
            onClick={() => navigate("/")}
            title="Hem"
          >
            <Home className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Hem</span>}
          </Button>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleSignOut}
            title="Logga ut"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
