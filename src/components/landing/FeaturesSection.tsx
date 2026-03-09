import { useState } from "react";
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

const modules = [
  {
    id: "chat",
    icon: MessageSquare,
    title: "AI-assistent",
    description: "Svara på frågor om rutiner, regler och arbetsplatsen – dygnet runt. Personalen frågar, WorkBuddy svarar direkt.",
    preview: {
      lines: [
        { role: "user", text: "Vad gör jag vid larm i byggnad C?" },
        { role: "bot", text: "Gå till centralenheten i entréhallen. Kontrollera larmkoden på displayen. Om det är brandlarm → ring 112 direkt. Annars kontakta jourhavande." },
      ],
    },
  },
  {
    id: "schedule",
    icon: Calendar,
    title: "Schemahantering",
    description: "Alla ser sitt schema i realtid. Inga missade pass, inga Messenger-trådar om vem som jobbar.",
    preview: {
      entries: [
        { time: "07:00–15:00", name: "Anna L.", role: "Platschef" },
        { time: "08:00–16:00", name: "Erik S.", role: "Montör" },
        { time: "14:00–22:00", name: "Maria K.", role: "Kväll" },
      ],
    },
  },
  {
    id: "checklists",
    icon: ClipboardList,
    title: "Checklistor",
    description: "Dagliga uppgifter som bockas av i realtid. Synligt för hela teamet – inget faller mellan stolarna.",
    preview: {
      items: [
        { text: "Morgoninspektion utförd", done: true },
        { text: "Utrustning kontrollerad", done: true },
        { text: "Dagrapport inskickad", done: false },
      ],
    },
  },
  {
    id: "routines",
    icon: Book,
    title: "Rutiner & dokumentation",
    description: "All dokumentation samlad och sökbar. SOPs, manualer och instruktioner tillgängliga direkt i mobilen.",
    preview: null,
  },
  {
    id: "incidents",
    icon: AlertTriangle,
    title: "Avvikelsehantering",
    description: "Rapportera, spåra och lös avvikelser med full beviskedja. Foto, tidsstämpel och ansvarig – allt dokumenterat.",
    preview: null,
  },
  {
    id: "team",
    icon: Users,
    title: "Team-chat",
    description: "Intern kommunikation som stannar på arbetsplatsen. Inga privata appar, ingen röra.",
    preview: null,
  },
  {
    id: "announcements",
    icon: Bell,
    title: "Meddelanden",
    description: "Skicka ut information till hela teamet eller enskilda. Alla får samma information samtidigt.",
    preview: null,
  },
  {
    id: "documents",
    icon: FileText,
    title: "Dokument & certifikat",
    description: "Hantera certifikat, utbildningsbevis och viktiga dokument med automatiska påminnelser vid utgång.",
    preview: null,
  },
  {
    id: "admin",
    icon: Shield,
    title: "Adminpanel",
    description: "Full kontroll för chefer. Hantera personal, behörigheter och innehåll från ett ställe.",
    preview: null,
  },
];

const ModulePreview = ({ module }: { module: typeof modules[0] }) => {
  if (module.id === "chat" && module.preview && "lines" in module.preview) {
    return (
      <div className="space-y-3 p-4">
        {module.preview.lines.map((line, i) => (
          <div key={i} className={`flex ${line.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-[12px] leading-relaxed ${
              line.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}>
              {line.text}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (module.id === "schedule" && module.preview && "entries" in module.preview) {
    return (
      <div className="p-4 space-y-1.5">
        {module.preview.entries.map((e, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/50">
            <span className="text-[11px] font-mono text-muted-foreground">{e.time}</span>
            <span className="text-[11px] font-medium text-foreground">{e.name}</span>
            <span className="text-[10px] text-muted-foreground">{e.role}</span>
          </div>
        ))}
      </div>
    );
  }
  if (module.id === "checklists" && module.preview && "items" in module.preview) {
    return (
      <div className="p-4 space-y-2">
        {module.preview.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${item.done ? "bg-primary border-primary" : "border-border"}`}>
              {item.done && <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-[12px] ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.text}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const FeaturesSection = () => {
  const [active, setActive] = useState(0);
  const activeModule = modules[active];
  const Icon = activeModule.icon;

  return (
    <section id="product" className="landing-section bg-background border-t border-border">
      <div className="landing-container">
        <div className="mb-16">
          <div className="landing-badge mb-4">Produktmoduler</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            Samla internkommunikation och personalinformation på ett ställe
          </h2>
          <p className="text-muted-foreground text-base max-w-xl">
            Nio moduler. En plattform. Allt din arbetsplats behöver för att fungera effektivt.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Module list */}
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {modules.map((mod, i) => {
              const ModIcon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[13px] whitespace-nowrap lg:whitespace-normal transition-all ${
                    i === active
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <ModIcon className="h-4 w-4 shrink-0" />
                  {mod.title}
                </button>
              );
            })}
          </div>

          {/* Module detail */}
          <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[280px]">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{activeModule.title}</h3>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed max-w-lg">
                {activeModule.description}
              </p>
            </div>
            {activeModule.preview ? (
              <ModulePreview module={activeModule} />
            ) : (
              <div className="p-6 flex items-center justify-center min-h-[120px]">
                <div className="text-center">
                  <Icon className="h-8 w-8 text-border mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">Boka en demo för att se {activeModule.title.toLowerCase()} i aktion</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
