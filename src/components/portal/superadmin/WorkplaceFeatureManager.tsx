import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

const ALL_FEATURES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "team-chat", label: "Teamchatt", icon: MessagesSquare },
  { id: "schedule", label: "Schema", icon: Calendar },
  { id: "checklists", label: "Checklistor", icon: ClipboardList },
  { id: "routines", label: "Rutiner", icon: Book },
  { id: "announcements", label: "Nyheter", icon: Bell },
  { id: "incidents", label: "Avvikelser", icon: AlertTriangle },
  { id: "certificates", label: "Certifikat", icon: Award },
  { id: "employees", label: "Personal", icon: Users },
] as const;

const DEFAULT_ENABLED = ALL_FEATURES.map((f) => f.id);

interface WorkplaceFeatureManagerProps {
  workplaceId: string;
  currentSettings: Record<string, unknown> | null;
  onSettingsUpdated?: () => void;
}

export function WorkplaceFeatureManager({
  workplaceId,
  currentSettings,
  onSettingsUpdated,
}: WorkplaceFeatureManagerProps) {
  const { toast } = useToast();
  const enabledFeatures: string[] =
    (currentSettings?.enabled_features as string[]) ?? DEFAULT_ENABLED;
  const [features, setFeatures] = useState<string[]>(enabledFeatures);
  const [saving, setSaving] = useState(false);

  const toggle = async (featureId: string, checked: boolean) => {
    const updated = checked
      ? [...features, featureId]
      : features.filter((f) => f !== featureId);
    setFeatures(updated);
    setSaving(true);

    const { data, error } = await supabase.functions.invoke("manage-workplace", {
      body: {
        action: "update-settings",
        workplace_id: workplaceId,
        settings: { enabled_features: updated },
      },
    });

    setSaving(false);
    if (error || data?.error) {
      toast({ title: "Kunde inte spara", description: data?.error || error?.message, variant: "destructive" });
      setFeatures(enabledFeatures); // rollback
    } else {
      toast({ title: "Funktioner uppdaterade" });
      onSettingsUpdated?.();
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground mb-4">
        Aktivera eller inaktivera funktioner för denna arbetsplats. WorkBuddy (AI-chatten) är alltid aktiv.
      </p>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {ALL_FEATURES.map((feature) => {
          const Icon = feature.icon;
          const isEnabled = features.includes(feature.id);
          return (
            <div key={feature.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => toggle(feature.id, checked)}
                disabled={saving}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ALL_FEATURES, DEFAULT_ENABLED };
