import { useEffect, useState } from "react";
import type { MockNotification } from "./PresentationMockData";
import { AlertTriangle, Award, CheckCircle, Calendar } from "lucide-react";

interface Props {
  notifications: MockNotification[];
}

const ICONS = {
  incident: AlertTriangle,
  certificate: Award,
  checklist: CheckCircle,
  schedule: Calendar,
};

const BG_COLORS = {
  incident: "bg-destructive/10 border-destructive/30",
  certificate: "bg-yellow-500/10 border-yellow-500/30",
  checklist: "bg-green-500/10 border-green-500/30",
  schedule: "bg-primary/10 border-primary/30",
};

const ICON_COLORS = {
  incident: "text-destructive",
  certificate: "text-yellow-500",
  checklist: "text-green-600",
  schedule: "text-primary",
};

export function PresentationNotificationToast({ notifications }: Props) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    notifications.forEach(n => {
      if (!visible.includes(n.id)) {
        // Animate in
        setTimeout(() => setVisible(prev => [...prev, n.id]), 50);
      }
    });
  }, [notifications]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
      {notifications.map(n => {
        const Icon = ICONS[n.type];
        const isVisible = visible.includes(n.id);
        return (
          <div
            key={n.id + n.timestamp}
            className={`
              flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md
              max-w-sm transition-all duration-500 ease-out
              ${BG_COLORS[n.type]}
              ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${ICON_COLORS[n.type]}`} />
            <div>
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Just nu</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
