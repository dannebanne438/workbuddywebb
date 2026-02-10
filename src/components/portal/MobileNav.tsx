import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WorkplaceSelector } from "./WorkplaceSelector";
import { NotificationBell } from "./notifications/NotificationBell";
import {
  Camera,
  Calendar,
  ClipboardList,
  Book,
  Bell,
  Users,
  Settings,
  LogOut,
  Shield,
  Home,
  MessagesSquare,
  Menu,
  Sparkles,
  LayoutDashboard,
  AlertTriangle,
  Award,
} from "lucide-react";

type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents";

interface MobileNavProps {
  currentView: PortalView;
  onViewChange: (view: PortalView) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const viewLabels: Record<PortalView, string> = {
  dashboard: "Dashboard",
  camera: "Kamera",
  "team-chat": "Teamchatt",
  schedule: "Schema",
  checklists: "Checklistor",
  routines: "Rutiner",
  announcements: "Nyheter",
  employees: "Personal",
  settings: "Inställningar",
  admin: "Super Admin",
  "workplace-detail": "Arbetsplats",
  certificates: "Certifikat",
  incidents: "Avvikelser",
};

export function MobileNav({ currentView, onViewChange, open, onOpenChange }: MobileNavProps) {
  const { profile, signOut, isSuperAdmin, isWorkplaceAdmin } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    ...(isWorkplaceAdmin ? [{ id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard }] : []),
    { id: "camera" as const, label: "Kamera", icon: Camera },
    { id: "team-chat" as const, label: "Teamchatt", icon: MessagesSquare },
    { id: "schedule" as const, label: "Schema", icon: Calendar },
    { id: "checklists" as const, label: "Checklistor", icon: ClipboardList },
    { id: "routines" as const, label: "Rutiner", icon: Book },
    { id: "announcements" as const, label: "Nyheter", icon: Bell },
    { id: "incidents" as const, label: "Avvikelser", icon: AlertTriangle },
  ];

  const adminItems = [
    { id: "employees" as const, label: "Personal", icon: Users },
    { id: "certificates" as const, label: "Certifikat", icon: Award },
    { id: "settings" as const, label: "Inställningar", icon: Settings },
  ];

  const superAdminItems = [
    { id: "admin" as const, label: "Super Admin", icon: Shield },
  ];

  const handleNavClick = (view: PortalView) => {
    onViewChange(view);
    onOpenChange(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <Link to="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg wb-gradient-accent flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">W</span>
                  </div>
                  <span className="font-semibold text-foreground">WorkBuddy</span>
                </Link>
              </div>

              {/* Workplace Selector for Super Admin */}
              {isSuperAdmin && <WorkplaceSelector />}

              {/* Workplace Info */}
              {activeWorkplace && !isSuperAdmin && (
                <div className="p-4 border-b border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Arbetsplats</p>
                  <p className="font-medium text-foreground truncate">{activeWorkplace.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{activeWorkplace.company_name}</p>
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
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}

                {isWorkplaceAdmin && (
                  <>
                    <div className="py-2">
                      <div className="h-px bg-border" />
                    </div>
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </>
                )}

                {isSuperAdmin && (
                  <>
                    <div className="py-2">
                      <div className="h-px bg-border" />
                    </div>
                    {superAdminItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* User Info */}
              <div className="p-4 border-t border-border">
                {profile && (
                  <div className="mb-3">
                    <p className="font-medium text-foreground truncate text-sm">{profile.full_name || profile.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      navigate("/");
                      onOpenChange(false);
                    }}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Hem
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg wb-gradient-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-medium text-foreground text-sm">{viewLabels[currentView]}</span>
        </div>

        <NotificationBell onNavigate={onViewChange} collapsed />
      </header>
    </>
  );
}
