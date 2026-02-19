import { usePresentation } from "@/contexts/PresentationContext";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Calendar } from "lucide-react";
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

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative text-center max-w-lg px-6 animate-fade-in">
        <div className="h-20 w-20 rounded-2xl wb-gradient-accent flex items-center justify-center mx-auto mb-8">
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Redo att ta kontroll över er arbetsplats?
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          WorkBuddy hjälper er att digitalisera, dokumentera och effektivisera – från dag ett.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" size="xl" onClick={handlePilot}>
            <Rocket className="h-5 w-5 mr-2" />
            Starta pilot
          </Button>
          <Button variant="hero-outline" size="xl" onClick={handleDemo}>
            <Calendar className="h-5 w-5 mr-2" />
            Boka genomgång
          </Button>
        </div>

        <button
          onClick={exit}
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Fortsätt till portalen →
        </button>
      </div>
    </div>
  );
}
