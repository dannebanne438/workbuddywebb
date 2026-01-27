import { useState } from "react";
import { ChatView } from "./views/ChatView";
import { ScheduleView } from "./views/ScheduleView";
import { ChecklistsView } from "./views/ChecklistsView";
import { RoutinesView } from "./views/RoutinesView";
import { AnnouncementsView } from "./views/AnnouncementsView";
import { EmployeesView } from "./views/EmployeesView";
import { SettingsView } from "./views/SettingsView";
import { SuperAdminView } from "./views/SuperAdminView";
import { WorkplaceDetailView } from "./views/WorkplaceDetailView";
import { PortalSidebar } from "./PortalSidebar";

type PortalView = "chat" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin" | "workplace-detail";

export function PortalContent() {
  const [currentView, setCurrentView] = useState<PortalView>("chat");
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null);

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
    <div className="flex h-screen">
      <PortalSidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}
