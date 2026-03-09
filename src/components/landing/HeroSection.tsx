import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const ProductMockup = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div className={`relative transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Browser chrome */}
      <div className="rounded-xl border border-border bg-card overflow-hidden wb-shadow-elevated">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/40">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="ml-3 flex-1 h-5 bg-secondary rounded-md max-w-[200px]" />
        </div>
        {/* App content */}
        <div className="flex min-h-[320px] sm:min-h-[380px]">
          {/* Sidebar */}
          <div className="w-[140px] sm:w-[180px] border-r border-border p-3 space-y-1 hidden sm:block bg-muted/20">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10">
              <div className="w-3.5 h-3.5 rounded bg-primary/30" />
              <span className="text-[11px] font-medium text-primary">Dashboard</span>
            </div>
            {["Schema", "Checklistor", "Rutiner", "Team-chat", "Avvikelser"].map((item) => (
              <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 transition-colors">
                <div className="w-3.5 h-3.5 rounded bg-border" />
                <span className="text-[11px]">{item}</span>
              </div>
            ))}
          </div>
          {/* Main content */}
          <div className="flex-1 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-muted-foreground">Idag</div>
                <div className="text-sm font-semibold text-foreground">Dashboard</div>
              </div>
              <div className="h-6 px-2.5 rounded-md bg-primary text-primary-foreground text-[10px] font-medium flex items-center">
                + Rapportera
              </div>
            </div>
            {/* KPI row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Aktiva idag", value: "12" },
                { label: "Öppna ärenden", value: "3" },
                { label: "Certifikat ⚠️", value: "2" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-muted/40 rounded-lg p-2.5 border border-border/50">
                  <div className="text-lg font-bold text-foreground leading-none">{kpi.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>
            {/* Schedule list */}
            <div>
              <div className="text-[11px] font-medium text-muted-foreground mb-2">Dagens schema</div>
              <div className="space-y-1">
                {[
                  { time: "07:00–15:00", name: "Anna L.", role: "Platschef" },
                  { time: "08:00–16:00", name: "Erik S.", role: "Montör" },
                  { time: "14:00–22:00", name: "Maria K.", role: "Support" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground w-[80px]">{s.time}</span>
                      <span className="text-[11px] text-foreground font-medium">{s.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{s.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-32 pb-8 sm:pt-36 sm:pb-12 bg-background relative">
      <div className="landing-container">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="landing-badge mb-6">
            Plattform för internkommunikation
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.1] tracking-tight mb-5">
            Allt din arbetsplats behöver.{" "}
            <span className="bg-clip-text text-transparent wb-gradient-accent">
              Ett system.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            WorkBuddy samlar internkommunikation, personalhantering, schema och rutiner i en plattform – byggd för företag som vill ha kontroll.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button size="lg" className="rounded-lg h-11 px-6 text-sm" onClick={scrollToContact}>
              Boka demo
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-lg h-11 px-6 text-sm" asChild>
              <Link to="/login">Logga in</Link>
            </Button>
          </div>
        </div>

        <ProductMockup />
      </div>
    </section>
  );
};
