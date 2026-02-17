import { useState, useEffect } from "react";
import { CameraWithChatView } from "./views/CameraWithChatView";
import { TeamChatView } from "./views/TeamChatView";
import { ScheduleView } from "./views/ScheduleView";
import { ChecklistsView } from "./views/ChecklistsView";
import { RoutinesView } from "./views/RoutinesView";
import { AnnouncementsView } from "./views/AnnouncementsView";
import { EmployeesView } from "./views/EmployeesView";
import { SettingsView } from "./views/SettingsView";
import { SuperAdminView } from "./views/SuperAdminView";
import { WorkplaceDetailView } from "./views/WorkplaceDetailView";
import { DashboardView } from "./views/DashboardView";
import { CertificatesView } from "./views/CertificatesView";
import { IncidentsView } from "./views/IncidentsView";
import { DocumentsView } from "./views/DocumentsView";
import { PhotoGalleryView } from "./views/PhotoGalleryView";
import { PortalSidebar } from "./PortalSidebar";
import { MobileNav } from "./MobileNav";
import { MobileBottomNav } from "./MobileBottomNav";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { isFeatureEnabled } from "@/lib/features";
import { AlertTriangle } from "lucide-react";

type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents" | "documents" | "photos";

const ONBOARDING_KEY = "workbuddy_onboarding_complete";

export function PortalContent() {
  const { profile, isSuperAdmin } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const [currentView, setCurrentView] = useState<PortalView>("camera");
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleSelectWorkplace = (workplaceId: string) => {
    setSelectedWorkplaceId(workplaceId);
    setCurrentView("workplace-detail");
  };

  const handleBackFromWorkplace = () => {
    setSelectedWorkplaceId(null);
    setCurrentView("admin");
  };

  const renderView = () => {
    // Block access to disabled features
    if (!isFeatureEnabled(currentView, activeWorkplace?.settings as Record<string, unknown> | null, isSuperAdmin)) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-background gap-3">
          <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-center">Denna funktion är inte aktiverad för din arbetsplats.</p>
        </div>
      );
    }

    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={setCurrentView} />;
      case "camera":
        return <CameraWithChatView />;
      case "team-chat":
        return <TeamChatView />;
      case "schedule":
        return <ScheduleView />;
      case "checklists":
        return <ChecklistsView />;
      case "routines":
        return <RoutinesView />;
      case "announcements":
        return <AnnouncementsView />;
      case "employees":
        return <EmployeesView />;
      case "settings":
        return <SettingsView />;
      case "incidents":
        return <IncidentsView />;
      case "documents":
        return <DocumentsView />;
      case "photos":
        return <PhotoGalleryView />;
      case "certificates":
        return <CertificatesView />;
      case "admin":
        return <SuperAdminView onSelectWorkplace={handleSelectWorkplace} />;
      case "workplace-detail":
        return selectedWorkplaceId ? (
          <WorkplaceDetailView 
            workplaceId={selectedWorkplaceId} 
            onBack={handleBackFromWorkplace} 
          />
        ) : (
          <SuperAdminView onSelectWorkplace={handleSelectWorkplace} />
        );
      default:
        return <CameraWithChatView />;
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <MobileNav
        currentView={currentView}
        onViewChange={setCurrentView}
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenMore={() => setMobileNavOpen(true)}
      />

      <div className="flex h-screen">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <PortalSidebar currentView={currentView} onViewChange={setCurrentView} />
        </div>
        
        {/* Main Content - with top padding on mobile for header, bottom padding for nav */}
        <div className="flex-1 relative pt-14 pb-16 md:pt-0 md:pb-0">
          {renderView()}
        </div>
      </div>
      
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        userName={profile?.full_name || undefined}
      />
    </>
  );
}
