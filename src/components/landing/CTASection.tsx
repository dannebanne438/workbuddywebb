import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTASection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 wb-gradient-accent opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Kom igång på minuter
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Redo att förbättra internkommunikationen i ert företag?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Boka en kostnadsfri demo och se hur WorkBuddy kan fungera som er digitala arbetsplattform – med verktyg för personalhantering, schema och kommunikation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" onClick={scrollToContact}>
              Boka en demo
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="hero-outline" size="xl" onClick={scrollToContact}>
              Ställ en fråga
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
