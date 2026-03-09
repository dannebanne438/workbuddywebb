import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="landing-container text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-5">
          Redo att testa?
        </h2>
        <p className="text-base text-muted-foreground max-w-md mx-auto mb-8">
          Boka en kostnadsfri demo och se hur WorkBuddy kan fungera för just er arbetsplats.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" className="rounded-lg h-11 px-6 text-sm" onClick={scrollToContact}>
            Boka demo
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-lg h-11 px-6 text-sm" onClick={scrollToContact}>
            Ställ en fråga
          </Button>
        </div>
      </div>
    </section>
  );
};
