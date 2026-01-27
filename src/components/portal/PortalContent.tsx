import { useState } from "react";
import { ChatView } from "./views/ChatView";
import { ScheduleView } from "./views/ScheduleView";
import { ChecklistsView } from "./views/ChecklistsView";
import { RoutinesView } from "./views/RoutinesView";
import { AnnouncementsView } from "./views/AnnouncementsView";
import { EmployeesView } from "./views/EmployeesView";
import { SettingsView } from "./views/SettingsView";
import { SuperAdminView } from "./views/SuperAdminView";
import { PortalSidebar } from "./PortalSidebar";

type PortalView = "chat" | "schedule" | "checklists" | "routines" | "announcements" | "employees" | "settings" | "admin";

export function PortalContent() {
  const [currentView, setCurrentView] = useState<PortalView>("chat");

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
        return <SuperAdminView />;
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
