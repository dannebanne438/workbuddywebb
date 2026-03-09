import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Calendar,
  ClipboardList,
  Book,
  Users,
  Bell,
  AlertTriangle,
  FileText,
  Shield,
} from "lucide-react";
import { Reveal, fadeUp } from "./animations";
import { AIChatScreen, ScheduleScreen, IncidentScreen } from "./ProductScreens";

const modules = [
  { id: "chat", icon: MessageSquare, title: "AI-assistent", description: "Svara på frågor om rutiner, regler och arbetsplatsen – dygnet runt.", hasScreen: true },
  { id: "schedule", icon: Calendar, title: "Schemahantering", description: "Alla ser sitt schema i realtid. Inga missade pass.", hasScreen: true },
  { id: "checklists", icon: ClipboardList, title: "Checklistor", description: "Dagliga uppgifter som bockas av i realtid. Synligt för hela teamet.", hasScreen: false },
  { id: "routines", icon: Book, title: "Rutiner & dokumentation", description: "All dokumentation samlad och sökbar direkt i mobilen.", hasScreen: false },
  { id: "incidents", icon: AlertTriangle, title: "Avvikelsehantering", description: "Rapportera, spåra och lös avvikelser med full beviskedja.", hasScreen: true },
  { id: "team", icon: Users, title: "Team-chat", description: "Intern kommunikation som stannar på arbetsplatsen.", hasScreen: false },
  { id: "announcements", icon: Bell, title: "Meddelanden", description: "Skicka ut information till hela teamet.", hasScreen: false },
  { id: "documents", icon: FileText, title: "Dokument & certifikat", description: "Hantera certifikat med automatiska påminnelser vid utgång.", hasScreen: false },
  { id: "admin", icon: Shield, title: "Adminpanel", description: "Full kontroll för chefer. Hantera personal, behörigheter och innehåll.", hasScreen: false },
];

const ChecklistPreview = () => (
  <div className="p-5 space-y-2.5">
    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Daglig checklista – Reception</div>
    {[
      { text: "Morgoninspektion utförd", done: true },
      { text: "Utrustning kontrollerad", done: true },
      { text: "Gästinfo uppdaterad", done: true },
      { text: "Kvällsrapport inskickad", done: false },
      { text: "Säkerhetsrond genomförd", done: false },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.08 }}
        className="flex items-center gap-3 py-1.5 group"
      >
        <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors ${item.done ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
          {item.done && <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className={`text-[12px] ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.text}</span>
      </motion.div>
    ))}
    <div className="mt-3 pt-3 border-t border-border">
      <div className="text-[10px] text-muted-foreground">3 av 5 klara · Anna L. · 14:30</div>
    </div>
  </div>
);

const GenericPreview = ({ mod }: { mod: typeof modules[0] }) => {
  const Icon = mod.icon;
  return (
    <div className="p-8 flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
          <Icon className="h-5 w-5 text-primary/40" />
        </div>
        <p className="text-[12px] text-muted-foreground max-w-[200px]">{mod.description}</p>
      </div>
    </div>
  );
};

export const FeaturesSection = () => {
  const [active, setActive] = useState(0);
  const activeModule = modules[active];
  const Icon = activeModule.icon;

  const renderPreview = () => {
    switch (activeModule.id) {
      case "chat": return <AIChatScreen />;
      case "schedule": return <ScheduleScreen />;
      case "incidents": return <IncidentScreen />;
      case "checklists": return <ChecklistPreview />;
      default: return <GenericPreview mod={activeModule} />;
    }
  };

  return (
    <section id="product" className="landing-section bg-background border-t border-border">
      <div className="landing-container">
        <Reveal>
          <div className="mb-16">
            <div className="landing-badge mb-4">Produktmoduler</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Samla internkommunikation och personalinformation på ett ställe
            </h2>
            <p className="text-muted-foreground text-base max-w-xl">
              Nio moduler. En plattform. Allt din arbetsplats behöver.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Module list */}
          <Reveal variants={fadeUp}>
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {modules.map((mod, i) => {
                const ModIcon = mod.icon;
                return (
                  <motion.button
                    key={mod.id}
                    onClick={() => setActive(i)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[13px] whitespace-nowrap lg:whitespace-normal transition-all ${
                      i === active
                        ? "bg-secondary text-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <ModIcon className={`h-4 w-4 shrink-0 transition-colors ${i === active ? "text-primary" : ""}`} />
                    {mod.title}
                    {mod.hasScreen && (
                      <span className="ml-auto text-[8px] text-primary/50 hidden lg:block">●</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Reveal>

          {/* Module detail */}
          <Reveal variants={fadeUp} custom={1}>
            <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[380px]">
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    key={activeModule.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground">{activeModule.title}</h3>
                </div>
                <p className="text-[14px] text-muted-foreground leading-relaxed max-w-lg">
                  {activeModule.description}
                </p>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeModule.hasScreen ? (
                    <div className="p-4">{renderPreview()}</div>
                  ) : activeModule.id === "checklists" ? (
                    renderPreview()
                  ) : (
                    renderPreview()
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
