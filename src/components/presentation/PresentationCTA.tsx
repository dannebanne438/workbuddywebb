import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2 } from "lucide-react";
import { usePresentation } from "@/contexts/PresentationContext";

export function PresentationCTA() {
  const { isByggPresentation } = usePresentation();

  const handleDemo = () => {
    window.open("/#contact", "_blank");
  };

  if (isByggPresentation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative text-center max-w-2xl px-6 animate-fade-in">
          <div className="h-20 w-20 rounded-2xl wb-gradient-accent flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">W</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
            Vill ni se hur detta fungerar på ert projekt?
          </h1>

          <div className="flex justify-center">
            <Button variant="hero" size="xl" onClick={handleDemo}>
              <Calendar className="h-5 w-5 mr-2" />
              Boka en genomgång
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const highlights = [
    "Avvikelsehantering med beviskedja och PDF-export",
    "Automatiska riskvarningar för certifikat och bemanning",
    "Digital platschef som förstår byggregler och AMA",
    "Realtidsschema med konfliktvarning",
    "Checklistor för skyddsrond och egenkontroll",
    "Modulärt – aktivera det ni behöver, när ni behöver det",
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative text-center max-w-2xl px-6 animate-fade-in">
        <div className="h-20 w-20 rounded-2xl wb-gradient-accent flex items-center justify-center mx-auto mb-8 shadow-lg">
          <span className="text-3xl font-bold text-primary-foreground">W</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Redo att digitalisera ert byggprojekt?
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ni har precis sett vad WorkBuddy kan göra. Föreställ er allt detta – anpassat för just ert projekt och er verksamhet.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10 text-left max-w-lg mx-auto">
          {highlights.map((text) => (
            <div key={text} className="flex items-start gap-2 p-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="hero" size="xl" onClick={handleDemo}>
            <Calendar className="h-5 w-5 mr-2" />
            Boka en genomgång
          </Button>
        </div>
      </div>
    </div>
  );
}
