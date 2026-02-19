import { usePresentation } from "@/contexts/PresentationContext";
import { Button } from "@/components/ui/button";
import { Rocket, Calendar, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PresentationCTA() {
  const { exit } = usePresentation();
  const navigate = useNavigate();

  const handlePilot = () => {
    exit();
    navigate("/#contact");
  };

  const handleDemo = () => {
    exit();
    navigate("/#contact");
  };

  const highlights = [
    "Fullständig avvikelsehantering med AI och beviskedja",
    "Realtidsschema med automatisk konfliktvarning",
    "Digital platschef tränad på er bransch",
    "Checklistor, certifikat och dokumenthantering",
    "Modulärt system – aktivera det ni behöver",
    "Ingen installation, igång på minuter",
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
          Redo att ta nästa steg?
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ni har precis sett vad WorkBuddy kan göra. Föreställ er allt detta – anpassat för er verksamhet.
        </p>

        {/* Summary highlights */}
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

        <button
          onClick={() => { exit(); navigate("/"); }}
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Tillbaka till startsidan →
        </button>
      </div>
    </div>
  );
}