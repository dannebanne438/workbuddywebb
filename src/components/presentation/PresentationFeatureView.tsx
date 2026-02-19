import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import {
  LayoutDashboard,
  MessagesSquare,
  Calendar,
  ClipboardList,
  Book,
  Bell,
  AlertTriangle,
  Award,
  Users,
  FileText,
  Image,
} from "lucide-react";

const DEMO_FEATURES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { id: "team-chat", label: "Teamchatt", icon: MessagesSquare, enabled: true },
  { id: "schedule", label: "Schema", icon: Calendar, enabled: true },
  { id: "checklists", label: "Checklistor", icon: ClipboardList, enabled: true },
  { id: "routines", label: "Rutiner", icon: Book, enabled: true },
  { id: "announcements", label: "Nyheter", icon: Bell, enabled: true },
  { id: "incidents", label: "Avvikelser", icon: AlertTriangle, enabled: true },
  { id: "certificates", label: "Certifikat", icon: Award, enabled: true },
  { id: "employees", label: "Personal", icon: Users, enabled: true },
  { id: "documents", label: "Dokument", icon: FileText, enabled: false },
  { id: "photos", label: "Bildbank", icon: Image, enabled: true },
];

export function PresentationFeatureView() {
  const [features, setFeatures] = useState(DEMO_FEATURES);
  const [animatedId, setAnimatedId] = useState<string | null>(null);

  // Auto-animate the "documents" toggle after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedId("documents");
      setFeatures((prev) =>
        prev.map((f) => (f.id === "documents" ? { ...f, enabled: true } : f))
      );
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Clear animation highlight after a moment
  useEffect(() => {
    if (!animatedId) return;
    const timer = setTimeout(() => setAnimatedId(null), 2000);
    return () => clearTimeout(timer);
  }, [animatedId]);

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl wb-gradient-accent flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Funktionshantering</h1>
            <p className="text-sm text-muted-foreground">
              Aktivera eller inaktivera funktioner per arbetsplats
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto" data-presentation="feature-switches">
          <p className="text-sm text-muted-foreground mb-4">
            Aktivera eller inaktivera funktioner för denna arbetsplats. WorkBuddy (AI-chatten) är alltid aktiv.
          </p>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isAnimating = animatedId === feature.id;
              return (
                <div
                  key={feature.id}
                  className={`flex items-center justify-between px-4 py-3 transition-colors duration-700 ${
                    isAnimating ? "bg-accent/10" : ""
                  }`}
                  data-feature-id={feature.id}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{feature.label}</span>
                    {isAnimating && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full animate-fade-in">
                        Aktiverad!
                      </span>
                    )}
                  </div>
                  <Switch checked={feature.enabled} disabled />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
