import { usePresentation } from "@/contexts/PresentationContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, Brain, Clock, Users } from "lucide-react";

export function PresentationIntro() {
  const { next, exit } = usePresentation();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />

      <div className="relative text-center max-w-2xl px-6 animate-fade-in">
        {/* Logo */}
        <div className="h-20 w-20 rounded-2xl wb-gradient-accent flex items-center justify-center mx-auto mb-8 shadow-lg">
          <span className="text-3xl font-bold text-primary-foreground">W</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          Välkommen till WorkBuddy
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
          Plattformen som gör arbetsplatser säkrare, smartare och enklare att leda.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-10 max-w-lg mx-auto">
          Under de kommande minuterna visar vi hur WorkBuddy hjälper er att gå från papperslappar och mejlkedjor till full digital kontroll – med AI som er assistent.
        </p>

        {/* Value props */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-xl mx-auto">
          {[
            { icon: Shield, label: "Säkerhet" },
            { icon: Brain, label: "AI-driven" },
            { icon: Clock, label: "Realtid" },
            { icon: Users, label: "Teamwork" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" size="xl" onClick={next}>
            Starta presentationen
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
          <Button variant="ghost" size="lg" onClick={exit} className="text-muted-foreground">
            Hoppa över
          </Button>
        </div>
      </div>
    </div>
  );
}