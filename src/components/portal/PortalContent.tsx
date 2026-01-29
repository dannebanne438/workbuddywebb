import { useState, useEffect } from "react";
import { ChatView } from "./views/ChatView";
import { TeamChatView } from "./views/TeamChatView";
import { ScheduleView } from "./views/ScheduleView";
import { ChecklistsView } from "./views/ChecklistsView";
import { RoutinesView } from "./views/RoutinesView";
import { AnnouncementsView } from "./views/AnnouncementsView";
import { EmployeesView } from "./views/EmployeesView";
import { SettingsView } from "./views/SettingsView";
import { SuperAdminView } from "./views/SuperAdminView";
import { WorkplaceDetailView } from "./views/WorkplaceDetailView";
import { PortalSidebar } from "./PortalSidebar";
import { MobileNav } from "./MobileNav";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";

type PortalView = "chat" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat";

const ONBOARDING_KEY = "workbuddy_onboarding_complete";

export function PortalContent() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<PortalView>("chat");
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
    switch (currentView) {
      case "chat":
        return <ChatView />;
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
        return <ChatView />;
    }
  };

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNav
        currentView={currentView}
        onViewChange={setCurrentView}
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />

      <div className="flex h-screen">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <PortalSidebar currentView={currentView} onViewChange={setCurrentView} />
        </div>
        
        {/* Main Content - with top padding on mobile for header */}
        <div className="flex-1 overflow-hidden pt-14 md:pt-0">
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
