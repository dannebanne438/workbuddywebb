import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, MessageSquare, MoreHorizontal, Camera, Battery, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

// Browser chrome wrapper
const BrowserFrame = ({
  children,
  className = "",
  url = "app.workbuddy.se",
}: {
  children: React.ReactNode;
  className?: string;
  url?: string;
}) => (
  <div className={`rounded-2xl border border-border bg-card overflow-hidden wb-shadow-elevated ${className}`}>
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
      </div>
      <div className="ml-2 flex-1 flex items-center h-6 bg-muted/60 rounded-md max-w-[240px] px-3">
        <span className="text-[10px] text-muted-foreground">{url}</span>
      </div>
    </div>
    {children}
  </div>
);

// Phone frame wrapper
const PhoneFrame = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`w-[260px] rounded-[2rem] border-[3px] border-foreground/10 bg-card overflow-hidden wb-shadow-elevated ${className}`}>
    <div className="flex justify-center pt-2 pb-1">
      <div className="w-20 h-4 bg-foreground/5 rounded-full" />
    </div>
    {children}
    <div className="flex justify-center py-2">
      <div className="w-8 h-1 bg-foreground/10 rounded-full" />
    </div>
  </div>
);

// Dashboard screen
export const DashboardScreen = ({ className = "" }: { className?: string }) => (
  <BrowserFrame className={className}>
    <div className="flex min-h-[380px]">
      {/* Sidebar */}
      <div className="w-[180px] border-r border-border p-3 space-y-0.5 hidden sm:block bg-muted/10">
        <div className="flex items-center gap-2 px-2.5 py-2 mb-3">
          <div className="w-5 h-5 rounded-md wb-gradient-accent flex items-center justify-center">
            <span className="text-[8px] font-bold text-primary-foreground">W</span>
          </div>
          <span className="text-[11px] font-semibold text-foreground">WorkBuddy</span>
        </div>
        {[
          { name: "Dashboard", active: true },
          { name: "Schema" },
          { name: "Checklistor" },
          { name: "Rutiner" },
          { name: "Team-chat" },
          { name: "Avvikelser" },
          { name: "Dokument" },
        ].map((item) => (
          <div
            key={item.name}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] transition-colors ${
              item.active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground"
            }`}
          >
            <div className={`w-3 h-3 rounded ${item.active ? "bg-primary/30" : "bg-border"}`} />
            {item.name}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 p-5 space-y-5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Idag · Måndag 9 mars</div>
            <div className="text-base font-semibold text-foreground mt-0.5">Dashboard</div>
          </div>
          <div className="flex gap-2">
            <div className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-[10px] font-medium flex items-center gap-1">
              + Rapportera
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: "Aktiva idag", value: "12", trend: "+2" },
            { label: "Öppna ärenden", value: "3", trend: "-1" },
            { label: "Checklistor klara", value: "8/10", trend: "" },
            { label: "Certifikat", value: "2", trend: "", warn: true },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-muted/30 rounded-lg p-3 border border-border/40">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-foreground leading-none">{kpi.value}</span>
                {kpi.trend && (
                  <span className={`text-[9px] font-medium ${kpi.trend.startsWith("+") ? "text-primary" : "text-destructive"}`}>
                    {kpi.trend}
                  </span>
                )}
              </div>
              <div className="text-[9px] text-muted-foreground mt-1.5 flex items-center gap-1">
                {(kpi as any).warn && <AlertTriangle className="w-2.5 h-2.5 text-destructive" />}
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Dagens schema</div>
          <div className="space-y-1">
            {[
              { time: "07:00–15:00", name: "Anna Lindgren", role: "Platschef", color: "bg-primary" },
              { time: "08:00–16:00", name: "Erik Svensson", role: "Montör", color: "bg-accent" },
              { time: "10:00–18:00", name: "Sara Nilsson", role: "Reception", color: "bg-primary/60" },
              { time: "14:00–22:00", name: "Maria Karlsson", role: "Support", color: "bg-accent/60" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-6 rounded-full ${s.color}`} />
                  <span className="text-[10px] font-mono text-muted-foreground w-[85px]">{s.time}</span>
                  <span className="text-[11px] text-foreground font-medium">{s.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">{s.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </BrowserFrame>
);

// AI Chat screen
export const AIChatScreen = ({ className = "" }: { className?: string }) => {
  const [visibleMessages, setVisibleMessages] = useState(0);

  const messages = [
    { role: "user", text: "Vad gör jag vid brandlarm i byggnad C?", time: "14:32" },
    { role: "bot", text: "Vid brandlarm i byggnad C:\n\n1. Gå till centralenheten i entréhallen\n2. Kontrollera larmkoden på displayen\n3. Om det är brandlarm → ring 112 direkt\n4. Evakuera enligt plan B-3\n5. Kontakta jourhavande: 070-123 45 67", time: "14:32" },
    { role: "user", text: "Vem är jourhavande ikväll?", time: "14:33" },
    { role: "bot", text: "Jourhavande ikväll (14:00–22:00) är Maria Karlsson.\n\nTelefon: 070-987 65 43\nRoll: Kvällsansvarig", time: "14:33" },
  ];

  useEffect(() => {
    if (visibleMessages < messages.length) {
      const t = setTimeout(() => setVisibleMessages((v) => v + 1), visibleMessages === 0 ? 800 : 1200);
      return () => clearTimeout(t);
    }
  }, [visibleMessages, messages.length]);

  return (
    <BrowserFrame className={className} url="app.workbuddy.se/chat">
      <div className="flex min-h-[380px]">
        <div className="w-[180px] border-r border-border p-3 hidden sm:block bg-muted/10">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">Konversationer</div>
          {["Brandlarm rutiner", "Nyckelhantering", "Schema mars"].map((c, i) => (
            <div key={c} className={`px-2.5 py-2 rounded-md text-[11px] mb-0.5 ${i === 0 ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}>
              {c}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="w-6 h-6 rounded-full wb-gradient-accent flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary-foreground">AI</span>
            </div>
            <span className="text-[12px] font-medium text-foreground">WorkBuddy AI</span>
            <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-1">Online</span>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-hidden">
            <AnimatePresence>
              {messages.slice(0, visibleMessages).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    <div className="text-[11px] leading-relaxed whitespace-pre-line">{msg.text}</div>
                    <div className={`text-[8px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {visibleMessages < messages.length && visibleMessages > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-md">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-muted/30">
              <span className="text-[11px] text-muted-foreground flex-1">Skriv en fråga...</span>
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
};

// Schedule screen
export const ScheduleScreen = ({ className = "" }: { className?: string }) => {
  const days = ["Mån 10", "Tis 11", "Ons 12", "Tor 13", "Fre 14"];
  const people = [
    { name: "Anna L.", shifts: [{ s: 0, e: 3 }, null, { s: 0, e: 3 }, null, { s: 0, e: 3 }] },
    { name: "Erik S.", shifts: [{ s: 1, e: 4 }, { s: 1, e: 4 }, null, { s: 1, e: 4 }, { s: 1, e: 4 }] },
    { name: "Maria K.", shifts: [null, { s: 2, e: 5 }, { s: 2, e: 5 }, { s: 2, e: 5 }, null] },
    { name: "Johan B.", shifts: [{ s: 3, e: 5 }, { s: 0, e: 2 }, { s: 3, e: 5 }, { s: 0, e: 2 }, { s: 3, e: 5 }] },
  ];
  const hours = ["07", "09", "11", "13", "15", "17"];
  const colors = ["bg-primary/70", "bg-accent/70", "bg-primary/50", "bg-accent/50"];

  return (
    <BrowserFrame className={className} url="app.workbuddy.se/schema">
      <div className="p-5 min-h-[340px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Vecka 11</div>
            <div className="text-sm font-semibold text-foreground">Schema – Mars 2026</div>
          </div>
          <div className="flex gap-1.5">
            <div className="h-6 px-2.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground flex items-center">Vecka</div>
            <div className="h-6 px-2.5 rounded-md bg-primary text-[10px] font-medium text-primary-foreground flex items-center">+ Lägg till</div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[80px_repeat(5,1fr)] text-[9px]">
            <div className="px-2 py-2 bg-muted/40 border-b border-r border-border font-medium text-muted-foreground" />
            {days.map((d) => (
              <div key={d} className="px-2 py-2 bg-muted/40 border-b border-r border-border last:border-r-0 font-medium text-muted-foreground text-center">{d}</div>
            ))}
            {people.map((p, pi) => (
              <>
                <div key={p.name} className="px-2 py-3 border-b border-r border-border text-[10px] font-medium text-foreground flex items-center">{p.name}</div>
                {p.shifts.map((sh, si) => (
                  <div key={si} className="px-1 py-2 border-b border-r border-border last:border-r-0 flex items-center justify-center">
                    {sh ? (
                      <div className={`${colors[pi]} text-primary-foreground rounded-md px-1.5 py-1 text-[8px] font-medium w-full text-center`}>
                        {hours[sh.s]}–{hours[sh.e]}
                      </div>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/30">–</span>
                    )}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
};

// Incident screen
export const IncidentScreen = ({ className = "" }: { className?: string }) => (
  <BrowserFrame className={className} url="app.workbuddy.se/avvikelser">
    <div className="p-5 min-h-[340px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avvikelsehantering</div>
          <div className="text-sm font-semibold text-foreground">3 öppna ärenden</div>
        </div>
        <div className="h-7 px-3 rounded-md bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center gap-1">
          ⚠ Rapportera
        </div>
      </div>
      <div className="space-y-2">
        {[
          { title: "Vattenläcka i omklädningsrum B", severity: "Hög", status: "Pågående", time: "2h sedan", assignee: "Erik S." },
          { title: "Trasig kortläsare vid entré", severity: "Medium", status: "Öppen", time: "5h sedan", assignee: "–" },
          { title: "Saknad brandsläckare plan 3", severity: "Hög", status: "Pågående", time: "1d sedan", assignee: "Anna L." },
        ].map((inc) => (
          <div key={inc.title} className="border border-border rounded-lg p-3.5 hover:bg-muted/20 transition-colors group cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">{inc.title}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${inc.severity === "Hög" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{inc.severity}</span>
                  <span className="text-[9px] text-muted-foreground">{inc.time}</span>
                  <span className="text-[9px] text-muted-foreground">→ {inc.assignee}</span>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${inc.status === "Pågående" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{inc.status}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Evidence section */}
      <div className="mt-4 p-3 border border-border rounded-lg bg-muted/20">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Senaste beviskedja</div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-14 h-14 rounded-md bg-muted border border-border flex items-center justify-center">
              <span className="text-[9px] text-muted-foreground">📷</span>
            </div>
          ))}
          <div className="flex-1 text-[9px] text-muted-foreground flex items-center px-2">
            3 foton · Tidsstämplade · Låsta
          </div>
        </div>
      </div>
    </div>
  </BrowserFrame>
);

// Mobile screen
export const MobileScreen = ({ className = "" }: { className?: string }) => (
  <PhoneFrame className={className}>
    <div className="min-h-[420px] bg-background">
      {/* Status bar */}
      <div className="flex justify-between px-5 py-1 text-[8px] text-muted-foreground">
        <span>14:32</span>
        <div className="flex gap-1 items-center">
          <span>5G</span>
          <span>🔋</span>
        </div>
      </div>
      {/* App header */}
      <div className="px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg wb-gradient-accent flex items-center justify-center">
          <span className="text-[9px] font-bold text-primary-foreground">W</span>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-foreground">WorkBuddy</div>
          <div className="text-[8px] text-muted-foreground">Grand Hotel Stockholm</div>
        </div>
      </div>
      {/* Quick actions */}
      <div className="px-4 py-2 flex gap-2">
        {["Mitt schema", "Checklist", "Fråga AI"].map((a) => (
          <div key={a} className="flex-1 text-center py-2 rounded-lg bg-muted/50 border border-border/50 text-[9px] font-medium text-foreground">{a}</div>
        ))}
      </div>
      {/* Today */}
      <div className="px-4 pt-3">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Idag</div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium text-foreground">Ditt pass: 07:00–15:00</div>
              <div className="text-[9px] text-muted-foreground">Platschef · Entré A</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px]">✓</span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-3 mb-1">Att göra</div>
          {[
            { text: "Morgoninspektion", done: true },
            { text: "Kontrollera larm", done: true },
            { text: "Kvällsrapport", done: false },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-2 py-1.5">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${t.done ? "bg-primary border-primary" : "border-border"}`}>
                {t.done && <svg className="w-2 h-2 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`text-[10px] ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom nav */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-around px-4 py-2.5 border-t border-border bg-background">
        {["Hem", "Schema", "Chat", "Mer"].map((n, i) => (
          <div key={n} className={`text-center ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
            <div className="text-[14px] mb-0.5">{["🏠", "📅", "💬", "⋯"][i]}</div>
            <div className="text-[8px] font-medium">{n}</div>
          </div>
        ))}
      </div>
    </div>
  </PhoneFrame>
);
