import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeroPreview } from "./HeroPreview";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen wb-gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in">
                WorkBuddy – plattform för internkommunikation och personalhantering
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-in text-balance" style={{ animationDelay: "0.2s" }}>
              En digital arbetsplattform som samlar rutiner, schema, personalinformation och kommunikation – så att företag får full kontroll och anställda alltid har rätt svar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/login">
                  Logga in
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" onClick={scrollToContact}>
                Kontakta oss
              </Button>
            </div>
          </div>

          {/* Preview animation */}
          <div className="animate-fade-in lg:animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
            <HeroPreview />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-pulse-soft" />
        </div>
      </div>
    </section>
  );
};
