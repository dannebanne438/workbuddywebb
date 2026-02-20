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
import { PresentationOverlay } from "../presentation/PresentationOverlay";
import { PresentationIntro } from "../presentation/PresentationIntro";
import { PresentationCTA } from "../presentation/PresentationCTA";
import { PresentationFeatureView } from "../presentation/PresentationFeatureView";
import { PresentationMultilingualChat } from "../presentation/PresentationMultilingualChat";
import { PresentationNotificationToast } from "../presentation/PresentationNotificationToast";
import { usePresentationMockData } from "../presentation/PresentationMockData";
import { PresentationProvider, usePresentation } from "@/contexts/PresentationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { isFeatureEnabled } from "@/lib/features";
import { AlertTriangle } from "lucide-react";

type PortalView = "camera" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail" | "team-chat" | "dashboard" | "certificates" | "incidents" | "documents" | "photos" | "features";

const ONBOARDING_KEY = "workbuddy_onboarding_complete";

function PortalContentInner() {
  const { profile, isSuperAdmin } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const { isPresentation, currentStepData } = usePresentation();
  const mockData = usePresentationMockData();
  const [currentView, setCurrentView] = useState<PortalView>("camera");
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingComplete && !isPresentation) {
      setShowOnboarding(true);
    }
  }, [isPresentation]);

  // Presentation mode drives the current view
  useEffect(() => {
    if (!isPresentation) return;
    const view = currentStepData.view;
    if (view !== "intro" && view !== "cta") {
      setCurrentView(view as PortalView);
    }
  }, [isPresentation, currentStepData]);

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
    // Presentation special views
    if (isPresentation) {
      if (currentStepData.view === "intro") return <PresentationIntro />;
      if (currentStepData.view === "cta") return <PresentationCTA />;
      if (currentStepData.view === "features") return <PresentationFeatureView />;
      // For camera steps in presentation, show the camera view with presentationMode
      if (currentStepData.view === "camera" && (currentStepData.id === "camera-analysis" || currentStepData.id === "bygg-slide-6")) {
        return <CameraViewPresentation />;
      }
      if (currentStepData.view === "camera" && currentStepData.id === "ai-chat") {
        return <PresentationMultilingualChat />;
      }
    }

    // Block access to disabled features (skip in presentation)
    if (!isPresentation && !isFeatureEnabled(currentView, activeWorkplace?.settings as Record<string, unknown> | null, isSuperAdmin)) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-background gap-3">
          <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-center">Denna funktion är inte aktiverad för din arbetsplats.</p>
        </div>
      );
    }

    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={setCurrentView} isPresentation={isPresentation} mockData={isPresentation ? mockData : undefined} />;
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
        return <EmployeesView isPresentation={isPresentation} />;
      case "settings":
        return <SettingsView />;
      case "incidents":
        return <IncidentsView isPresentation={isPresentation} mockData={isPresentation ? mockData : undefined} />;
      case "documents":
        return <DocumentsView />;
      case "photos":
        return <PhotoGalleryView />;
      case "certificates":
        return <CertificatesView />;
      case "features":
        return <PresentationFeatureView />;
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

  const hideNavigation = isPresentation && (currentStepData.view === "intro" || currentStepData.view === "cta");

  return (
    <>
      {/* Mobile Top Header */}
      {!hideNavigation && (
        <MobileNav
          currentView={currentView}
          onViewChange={setCurrentView}
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {!hideNavigation && (
        <MobileBottomNav
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenMore={() => setMobileNavOpen(true)}
        />
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar - hidden on mobile and during presentation intro/cta */}
        {!hideNavigation && (
          <div className="hidden md:block">
            <PortalSidebar currentView={currentView} onViewChange={setCurrentView} />
          </div>
        )}
        
        {/* Main Content */}
        <div className={`flex-1 relative ${hideNavigation ? "" : "pt-14 pb-16 md:pt-0 md:pb-0"}`}>
          {renderView()}
        </div>
      </div>

      {/* Presentation overlay */}
      <PresentationOverlay />
      {isPresentation && <PresentationNotificationToast notifications={mockData.notifications} />}
      
      {!isPresentation && (
        <OnboardingModal
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
          userName={profile?.full_name || undefined}
        />
      )}
    </>
  );
}

// Simple camera view wrapper for presentation "analysis" step
function CameraViewPresentation() {
  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl wb-gradient-accent flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Fotodokumentation</h1>
            <p className="text-sm text-muted-foreground">AI-analys av arbetsplatsbild</p>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Simulated image */}
          <div className="w-full rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center h-48">
            <div className="text-center text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <p className="text-sm">Vattenläcka i korridoren</p>
            </div>
          </div>

          {/* AI confidence badge */}
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-3 py-2" data-presentation="ai-badge">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span className="text-sm text-foreground">
              AI-förslag: <strong>Avvikelse</strong> (hög säkerhet)
            </span>
          </div>

          {/* Type selector */}
          <div className="flex gap-2">
            <div className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium h-10 px-4 border border-input bg-background text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              Nyhet
            </div>
            <div className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium h-10 px-4 bg-destructive text-destructive-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Avvikelse
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="text-sm font-medium text-foreground">Rubrik</label>
            <div className="mt-1 h-10 rounded-lg border border-input bg-background px-3 flex items-center text-sm text-foreground">
              Vattenläcka i korridoren
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Beskrivning</label>
            <div className="mt-1 min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              Läckage upptäckt vid rörkoppling i korridor B2. Vatten droppar från taket och samlas på golvet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortalContent() {
  return (
    <PresentationProvider>
      <PortalContentInner />
    </PresentationProvider>
  );
}
