import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, fadeUp } from "./animations";

const industries = [
  {
    id: "security",
    name: "Säkerhet",
    headline: "Rondering, larm och incidentrapporter – i ett system",
    description: "Väktare får svar på rutiner direkt i mobilen. Incidenter dokumenteras med foto, tidsstämpel och GPS.",
    features: ["AI som svarar på larmrutiner", "Incidentrapporter med beviskedja", "Certifikathantering med påminnelser", "Skiftschema med rollfördelning"],
    ui: {
      title: "Säkerhetsrond – Byggnad C",
      items: [
        { label: "Entré kontrollerad", status: "done" },
        { label: "Brandlarm testat", status: "done" },
        { label: "Kamerarum inspekterat", status: "active" },
        { label: "Parkeringsgarage", status: "pending" },
      ],
    },
  },
  {
    id: "staffing",
    name: "Bemanning",
    headline: "Hundratals konsulter. Tiotals arbetsplatser.",
    description: "Ny personal får onboarding direkt. Schemat uppdateras i realtid. Ingen faller mellan stolarna.",
    features: ["Automatisk onboarding per arbetsplats", "Schema synligt för alla konsulter", "Checklistor för varje ny placering", "Team-chat per arbetsgrupp"],
    ui: {
      title: "Onboarding – Ny konsult",
      items: [
        { label: "Välkomstinfo skickad", status: "done" },
        { label: "Rutin-quiz slutförd", status: "done" },
        { label: "Första arbetspass tilldelat", status: "active" },
        { label: "Mentor tilldelad", status: "pending" },
      ],
    },
  },
  {
    id: "hotel",
    name: "Hotell",
    headline: "Städscheman, gästinfo och rutiner – samlat",
    description: "Receptionen vet vilka rum som ska städas. Housekeeping bockar av i realtid.",
    features: ["Dagliga checklistor för housekeeping", "Rutiner per avdelning", "Meddelanden till hela teamet", "Dokumentation av avvikelser"],
    ui: {
      title: "Housekeeping – Dag",
      items: [
        { label: "Rum 201–210 städade", status: "done" },
        { label: "Rum 211–220 städade", status: "done" },
        { label: "Rum 221–230", status: "active" },
        { label: "Lobby & reception", status: "pending" },
      ],
    },
  },
  {
    id: "gym",
    name: "Gym & fitness",
    headline: "Passinfo, städrutiner och öppningsrutiner – digitalt",
    description: "Instruktörer ser gruppträningsschema. Personal får ansvarsfördelning. Inga papperslappar.",
    features: ["Schema för pass och personal", "Öppnings- och stängningsrutiner", "Kontaktlista för leverantörer", "AI-assistent för vanliga frågor"],
    ui: {
      title: "Öppningsrutin – Morgon",
      items: [
        { label: "Larm avaktiverat", status: "done" },
        { label: "Ventilation startad", status: "done" },
        { label: "Locker rooms inspekterade", status: "active" },
        { label: "Gruppträning förberett", status: "pending" },
      ],
    },
  },
];

export const UseCasesSection = () => {
  const [active, setActive] = useState(0);
  const current = industries[active];

  return (
    <section id="use-cases" className="landing-section bg-background border-t border-border">
      <div className="landing-container">
        <Reveal>
          <div className="mb-16">
            <div className="landing-badge mb-4">Branscher</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Verktyg för personalhantering i alla branscher
            </h2>
            <p className="text-muted-foreground text-base max-w-xl">
              WorkBuddy anpassas efter varje arbetsplats.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
            {industries.map((ind, i) => (
              <motion.button
                key={ind.id}
                onClick={() => setActive(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${
                  i === active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {ind.name}
              </motion.button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">{current.headline}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">{current.description}</p>
              <div className="space-y-3">
                {current.features.map((f, i) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform" />
                    <span className="text-[14px] text-foreground">{f}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Interactive product card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-destructive/40" />
                <div className="w-2 h-2 rounded-full bg-accent/40" />
                <div className="w-2 h-2 rounded-full bg-primary/30" />
                <span className="ml-2 text-[9px] text-muted-foreground">WorkBuddy → {current.name}</span>
              </div>
              <div className="p-5">
                <div className="text-[11px] font-medium text-foreground mb-4">{current.ui.title}</div>
                <div className="space-y-2">
                  {current.ui.items.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        item.status === "active"
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/50 bg-muted/20"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        item.status === "done"
                          ? "bg-primary border-primary"
                          : item.status === "active"
                          ? "border-primary animate-pulse"
                          : "border-border"
                      }`}>
                        {item.status === "done" && (
                          <svg className="w-2 h-2 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <span className={`text-[12px] ${item.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.label}</span>
                      {item.status === "active" && (
                        <span className="ml-auto text-[9px] text-primary font-medium">Pågår</span>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">2 av 4 klara</span>
                  <span className="text-[10px] text-primary font-medium">50%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
