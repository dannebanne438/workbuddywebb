import { useState, useEffect, useRef } from "react";
import { usePresentation } from "@/contexts/PresentationContext";

// Mock data that "appears" during the presentation for a wow effect

export interface MockIncident {
  id: string;
  title: string;
  severity: string;
  category: string;
  reported_by_name: string;
  status: string;
  created_at: string;
  description: string;
  isNew?: boolean;
}

export interface MockCertWarning {
  id: string;
  user_name: string;
  certificate_type: string;
  expiry_date: string;
  status: string;
  isNew?: boolean;
}

export interface MockScheduleEntry {
  id: string;
  user_name: string;
  start_time: string;
  end_time: string;
  role: string;
  isNew?: boolean;
}

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: "incident" | "certificate" | "checklist" | "schedule";
  timestamp: number;
}

const MOCK_INCIDENTS: Omit<MockIncident, "isNew">[] = [
  {
    id: "mock-1",
    title: "Bristfällig avspärrning vid schakt",
    severity: "critical",
    category: "safety",
    reported_by_name: "Erik Lindström",
    status: "open",
    created_at: new Date().toISOString(),
    description: "Avspärrning saknas vid öppen schakt, djup ca 1.5m, nära gångväg till bod.",
  },
  {
    id: "mock-2",
    title: "Skadad ställning sektion B3",
    severity: "critical",
    category: "safety",
    reported_by_name: "Anna Karlsson",
    status: "open",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    description: "Lodrätt rör i ställning B3 har synlig buckling. Ställningen spärrad.",
  },
  {
    id: "mock-3",
    title: "Vattenläcka vid rörkoppling korridor B2",
    severity: "medium",
    category: "quality",
    reported_by_name: "Johan Svensson",
    status: "investigating",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    description: "Läckage upptäckt vid rörkoppling. Vatten droppar från taket.",
  },
  {
    id: "mock-4",
    title: "Buller överstiger gränsvärde zon A",
    severity: "medium",
    category: "environment",
    reported_by_name: "Maria Nilsson",
    status: "open",
    created_at: new Date(Date.now() - 10800000).toISOString(),
    description: "Mätning visar 92 dB vid arbetsstation A4, gräns 85 dB.",
  },
  {
    id: "mock-5",
    title: "Försenad leverans betongpump",
    severity: "low",
    category: "delay",
    reported_by_name: "Oskar Berg",
    status: "open",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    description: "Betongpump försenad 2 timmar pga trafikstörning. Gjutning skjuts upp.",
  },
];

const MOCK_CERT_WARNINGS: Omit<MockCertWarning, "isNew">[] = [
  {
    id: "cert-1",
    user_name: "Erik Lindström",
    certificate_type: "Fallskydd",
    expiry_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
    status: "expiring_soon",
  },
  {
    id: "cert-2",
    user_name: "Johan Svensson",
    certificate_type: "Heta arbeten",
    expiry_date: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split("T")[0],
    status: "expired",
  },
  {
    id: "cert-3",
    user_name: "Anna Karlsson",
    certificate_type: "Truck A+B",
    expiry_date: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split("T")[0],
    status: "expiring_soon",
  },
];

const MOCK_SCHEDULE: Omit<MockScheduleEntry, "isNew">[] = [
  { id: "s1", user_name: "Erik Lindström", start_time: "06:00", end_time: "14:00", role: "Snickare" },
  { id: "s2", user_name: "Anna Karlsson", start_time: "06:00", end_time: "14:30", role: "Betongarbetare" },
  { id: "s3", user_name: "Johan Svensson", start_time: "07:00", end_time: "15:00", role: "Elektriker" },
  { id: "s4", user_name: "Maria Nilsson", start_time: "06:30", end_time: "15:00", role: "Platschef" },
  { id: "s5", user_name: "Oskar Berg", start_time: "07:00", end_time: "16:00", role: "UE – VVS" },
  { id: "s6", user_name: "Lisa Eriksson", start_time: "06:00", end_time: "14:00", role: "Snickare" },
  { id: "s7", user_name: "Karl Johansson", start_time: "08:00", end_time: "16:30", role: "Målare" },
  { id: "s8", user_name: "Sara Holm", start_time: "06:00", end_time: "14:00", role: "Ställningsbyggare" },
];

const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: "n1", title: "🔴 Ny avvikelse rapporterad", message: "Bristfällig avspärrning vid schakt – Erik Lindström", type: "incident", timestamp: 0 },
  { id: "n2", title: "⚠️ Certifikat utgår snart", message: "Eriks fallskyddscertifikat utgår om 3 dagar", type: "certificate", timestamp: 0 },
  { id: "n3", title: "✅ Skyddsrond slutförd", message: "Daglig skyddsrond Etapp 3 – slutförd av Erik kl 06:42", type: "checklist", timestamp: 0 },
];

export function usePresentationMockData() {
  const { isPresentation, currentStep, currentStepData } = usePresentation();
  const [incidents, setIncidents] = useState<MockIncident[]>([]);
  const [certWarnings, setCertWarnings] = useState<MockCertWarning[]>([]);
  const [schedule, setSchedule] = useState<MockScheduleEntry[]>([]);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [liveKPIs, setLiveKPIs] = useState({ activeToday: 0, openIncidents: 0, expiringCerts: 0, avgResolutionTime: "–" });
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up timers
  useEffect(() => {
    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  // Reset on step change and animate data appearing
  useEffect(() => {
    if (!isPresentation) return;
    
    // Clear previous timers
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    const view = currentStepData.view;
    const stepId = currentStepData.id;

    // Dashboard steps - animate KPIs counting up and data appearing
    if (view === "dashboard") {
      // Stagger KPIs
      setLiveKPIs({ activeToday: 0, openIncidents: 0, expiringCerts: 0, avgResolutionTime: "–" });
      setIncidents([]);
      setCertWarnings([]);

      const t1 = setTimeout(() => setLiveKPIs(prev => ({ ...prev, activeToday: 8 })), 400);
      const t2 = setTimeout(() => setLiveKPIs(prev => ({ ...prev, openIncidents: 3 })), 800);
      const t3 = setTimeout(() => setLiveKPIs(prev => ({ ...prev, expiringCerts: 2 })), 1200);
      const t4 = setTimeout(() => setLiveKPIs(prev => ({ ...prev, avgResolutionTime: "4h" })), 1600);
      timerRefs.current.push(t1, t2, t3, t4);

      // Animate incidents appearing one by one
      if (stepId === "dashboard-overview") {
        MOCK_INCIDENTS.slice(0, 3).forEach((inc, i) => {
          const t = setTimeout(() => {
            setIncidents(prev => [...prev, { ...inc, isNew: true }]);
            setTimeout(() => {
              setIncidents(prev => prev.map(p => p.id === inc.id ? { ...p, isNew: false } : p));
            }, 1000);
          }, 2000 + i * 800);
          timerRefs.current.push(t);
        });
      }

      // Risk warnings animate in
      if (stepId === "dashboard-risks") {
        MOCK_CERT_WARNINGS.forEach((cert, i) => {
          const t = setTimeout(() => {
            setCertWarnings(prev => [...prev, { ...cert, isNew: true }]);
            setTimeout(() => {
              setCertWarnings(prev => prev.map(p => p.id === cert.id ? { ...p, isNew: false } : p));
            }, 1200);
          }, 800 + i * 1000);
          timerRefs.current.push(t);
        });

        // Also add a notification popup
        const tn = setTimeout(() => {
          setNotifications(prev => [...prev, { ...MOCK_NOTIFICATIONS[1], timestamp: Date.now() }]);
        }, 2500);
        timerRefs.current.push(tn);
      }
    }

    // Incidents view - show incidents appearing
    if (view === "incidents") {
      setIncidents([]);
      MOCK_INCIDENTS.forEach((inc, i) => {
        const t = setTimeout(() => {
          setIncidents(prev => [...prev, { ...inc, isNew: true }]);
          setTimeout(() => {
            setIncidents(prev => prev.map(p => p.id === inc.id ? { ...p, isNew: false } : p));
          }, 800);
        }, 600 + i * 600);
        timerRefs.current.push(t);
      });

      // Notification for new incident
      if (stepId === "incidents-overview") {
        const tn = setTimeout(() => {
          setNotifications(prev => [...prev, { ...MOCK_NOTIFICATIONS[0], timestamp: Date.now() }]);
        }, 1500);
        timerRefs.current.push(tn);
      }
    }

    // Schedule view
    if (view === "schedule") {
      setSchedule([]);
      MOCK_SCHEDULE.forEach((entry, i) => {
        const t = setTimeout(() => {
          setSchedule(prev => [...prev, { ...entry, isNew: true }]);
          setTimeout(() => {
            setSchedule(prev => prev.map(p => p.id === entry.id ? { ...p, isNew: false } : p));
          }, 600);
        }, 300 + i * 400);
        timerRefs.current.push(t);
      });
    }

    // Checklists view - show notification
    if (view === "checklists") {
      const tn = setTimeout(() => {
        setNotifications(prev => [...prev, { ...MOCK_NOTIFICATIONS[2], timestamp: Date.now() }]);
      }, 2000);
      timerRefs.current.push(tn);
    }

    // Employees view
    if (view === "employees") {
      setSchedule([]);
      MOCK_SCHEDULE.forEach((entry, i) => {
        const t = setTimeout(() => {
          setSchedule(prev => [...prev, { ...entry, isNew: true }]);
          setTimeout(() => {
            setSchedule(prev => prev.map(p => p.id === entry.id ? { ...p, isNew: false } : p));
          }, 600);
        }, 200 + i * 300);
        timerRefs.current.push(t);
      });
    }

    // Certificates view 
    if (stepId === "certificates" || view === "certificates" as any) {
      setCertWarnings([]);
      MOCK_CERT_WARNINGS.forEach((cert, i) => {
        const t = setTimeout(() => {
          setCertWarnings(prev => [...prev, { ...cert, isNew: true }]);
          setTimeout(() => {
            setCertWarnings(prev => prev.map(p => p.id === cert.id ? { ...p, isNew: false } : p));
          }, 800);
        }, 500 + i * 700);
        timerRefs.current.push(t);
      });
    }

  }, [isPresentation, currentStep, currentStepData]);

  // Auto-dismiss notifications after 4s
  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[notifications.length - 1];
    const t = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== latest.id));
    }, 4500);
    return () => clearTimeout(t);
  }, [notifications]);

  return { incidents, certWarnings, schedule, notifications, liveKPIs };
}
