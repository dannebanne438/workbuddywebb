import { usePresentation } from "@/contexts/PresentationContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";

export function PresentationIntro() {
  const { next, exit } = usePresentation();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative text-center max-w-lg px-6 animate-fade-in">
        <div className="h-20 w-20 rounded-2xl wb-gradient-accent flex items-center justify-center mx-auto mb-8">
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Välkommen till WorkBuddy
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Er digitala kollega för smartare arbetsplatser. Låt oss visa vad systemet kan göra.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" size="xl" onClick={next}>
            Starta presentation
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
          <Button variant="ghost" size="lg" onClick={exit}>
            Hoppa över
          </Button>
        </div>
      </div>
    </div>
  );
}
