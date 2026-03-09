import { useState } from "react";

const industries = [
  {
    id: "security",
    name: "Säkerhetsföretag",
    headline: "Rondering, larm och incidentrapporter – i ett system",
    description: "Väktare får svar på rutiner direkt i mobilen. Incidenter dokumenteras med foto, tidsstämpel och GPS. Chefer ser allt i realtid.",
    features: ["AI som svarar på larmrutiner", "Incidentrapporter med beviskedja", "Certifikathantering med påminnelser", "Skiftschema med rollfördelning"],
  },
  {
    id: "staffing",
    name: "Bemanning",
    headline: "Hundratals konsulter. Tiotals arbetsplatser. En plattform.",
    description: "Ny personal får onboarding direkt. Schemat uppdateras i realtid. Ingen faller mellan stolarna.",
    features: ["Automatisk onboarding per arbetsplats", "Schema synligt för alla konsulter", "Checklistor för varje ny placering", "Team-chat per arbetsgrupp"],
  },
  {
    id: "hotel",
    name: "Hotell",
    headline: "Städscheman, gästinfo och receptionsrutiner – samlat",
    description: "Receptionen vet vilka rum som ska städas. Housekeeping bockar av i realtid. Alla får samma information.",
    features: ["Dagliga checklistor för housekeeping", "Rutiner per avdelning", "Meddelanden till hela teamet", "Dokumentation av avvikelser"],
  },
  {
    id: "gym",
    name: "Gym & fitness",
    headline: "Passinfo, städrutiner och öppningsrutiner – digitalt",
    description: "Instruktörer ser gruppträningsschema. Personal får städrutiner och ansvarsfördelning. Inga papperslappar.",
    features: ["Schema för pass och personal", "Öppnings- och stängningsrutiner", "Kontaktlista för leverantörer", "AI-assistent för vanliga frågor"],
  },
];

export const UseCasesSection = () => {
  const [active, setActive] = useState(0);
  const current = industries[active];

  return (
    <section id="use-cases" className="landing-section bg-background border-t border-border">
      <div className="landing-container">
        <div className="mb-16">
          <div className="landing-badge mb-4">Branscher</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            Verktyg för personalhantering i alla branscher
          </h2>
          <p className="text-muted-foreground text-base max-w-xl">
            WorkBuddy anpassas efter varje arbetsplats. Här är hur det används i praktiken.
          </p>
        </div>

        {/* Industry tabs */}
        <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
          {industries.map((ind, i) => (
            <button
              key={ind.id}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${
                i === active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>

        {/* Active industry */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
              {current.headline}
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              {current.description}
            </p>
            <div className="space-y-3">
              {current.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-[14px] text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simple product frame */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-border" />
              <div className="w-2 h-2 rounded-full bg-border" />
              <div className="w-2 h-2 rounded-full bg-border" />
            </div>
            <div className="p-6 space-y-4">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                WorkBuddy → {current.name}
              </div>
              <div className="space-y-2">
                {current.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50">
                    <div className="w-3.5 h-3.5 rounded bg-primary/20 flex items-center justify-center">
                      <svg className="w-2 h-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[12px] text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
