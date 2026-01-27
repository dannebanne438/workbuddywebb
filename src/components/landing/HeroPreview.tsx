import { useState, useEffect } from "react";
import { Check, MessageSquare, Calendar, ClipboardList } from "lucide-react";

const ChatMessage = ({ message, isBot, delay }: { message: string; isBot: boolean; delay: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className={`flex gap-2 animate-fade-in ${isBot ? "" : "flex-row-reverse"}`}>
      {isBot && (
        <div className="flex-shrink-0 h-7 w-7 rounded-full wb-gradient-accent flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">W</span>
        </div>
      )}
      <div
        className={`rounded-xl px-3 py-2 text-sm max-w-[200px] ${
          isBot
            ? "bg-card wb-shadow-soft text-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {message}
      </div>
    </div>
  );
};

const SchedulePreview = () => {
  const [items, setItems] = useState<number[]>([]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setItems([1]), 2500),
      setTimeout(() => setItems([1, 2]), 3000),
      setTimeout(() => setItems([1, 2, 3]), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const scheduleItems = [
    { time: "08:00", name: "Anna L.", role: "Kassa" },
    { time: "12:00", name: "Erik S.", role: "Lager" },
    { time: "16:00", name: "Maria K.", role: "Support" },
  ];

  return (
    <div className="bg-card rounded-xl wb-shadow-card p-4 space-y-3 animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Calendar className="h-4 w-4 text-primary" />
        Schema idag
      </div>
      <div className="space-y-2">
        {scheduleItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between text-sm p-2 rounded-lg transition-all duration-300 ${
              items.includes(index + 1)
                ? "bg-secondary opacity-100 translate-x-0"
                : "opacity-0 translate-x-4"
            }`}
          >
            <span className="text-muted-foreground font-mono">{item.time}</span>
            <span className="text-foreground">{item.name}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChecklistPreview = () => {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000);
    const checkTimers = [
      setTimeout(() => setChecked([1]), 5000),
      setTimeout(() => setChecked([1, 2]), 5500),
    ];
    return () => {
      clearTimeout(timer);
      checkTimers.forEach(clearTimeout);
    };
  }, []);

  if (!visible) return null;

  const items = [
    "Öppna kassan",
    "Kontrollera lager",
    "Uppdatera priser",
  ];

  return (
    <div className="bg-card rounded-xl wb-shadow-card p-4 space-y-3 animate-scale-in">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <ClipboardList className="h-4 w-4 text-accent" />
        Checklista för idag
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                checked.includes(index + 1)
                  ? "bg-accent border-accent"
                  : "border-border"
              }`}
            >
              {checked.includes(index + 1) && (
                <Check className="h-3 w-3 text-accent-foreground" />
              )}
            </div>
            <span className={checked.includes(index + 1) ? "text-muted-foreground line-through" : "text-foreground"}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HeroPreview = () => {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Background decoration */}
      <div className="absolute inset-0 wb-gradient-accent opacity-5 rounded-3xl blur-3xl animate-pulse-soft" />
      
      <div className="relative space-y-4 p-4">
        {/* Chat preview */}
        <div className="bg-card/80 backdrop-blur rounded-xl wb-shadow-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <MessageSquare className="h-4 w-4 text-primary" />
            WorkBuddy
          </div>
          <div className="space-y-3">
            <ChatMessage message="Hur ser schemat ut idag?" isBot={false} delay={500} />
            <ChatMessage message="Idag jobbar Anna 08-16, Erik 12-20 och Maria 16-22. Vill du veta mer?" isBot={true} delay={1500} />
          </div>
        </div>

        {/* Schedule preview */}
        <SchedulePreview />

        {/* Checklist preview */}
        <ChecklistPreview />
      </div>
    </div>
  );
};
