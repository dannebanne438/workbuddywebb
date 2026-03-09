import { useState, useEffect, useRef } from "react";
import { Building2, Users, MessageSquare, ClipboardCheck, Shield } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "Platskod",
    description: "Varje arbetsplats får sin egen kod",
    color: "from-primary to-primary/80",
  },
  {
    icon: Users,
    title: "Personal loggar in",
    description: "Mail + privat kod – kopplat till platsen",
    color: "from-accent to-accent/80",
  },
  {
    icon: MessageSquare,
    title: "Fråga WorkBuddy",
    description: "Rutiner, schema, lön, tider",
    color: "from-primary to-accent",
  },
  {
    icon: ClipboardCheck,
    title: "Systemet uppdateras",
    description: "Checklistor, schema och info skapas automatiskt",
    color: "from-accent to-primary",
  },
  {
    icon: Shield,
    title: "Chefer har kontroll",
    description: "Manuell meny + AI-stöd",
    color: "from-primary to-primary/80",
  },
];

export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            En enklare digital arbetsplats för företag
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kom igång med WorkBuddy i fem enkla steg – från platskod till full digital kontroll över kommunikation och personal.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center gap-2 mb-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeStep
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* Active step display */}
        <div className="max-w-lg mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;

            return (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  isActive
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 absolute transform translate-y-8 pointer-events-none"
                }`}
              >
                {isActive && (
                  <div className="text-center space-y-6">
                    <div className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} wb-shadow-card animate-scale-in`}>
                      <Icon className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-primary">
                        Steg {index + 1}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground animate-fade-in">
                        {step.title}
                      </h3>
                      <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* All steps grid (visible on larger screens) */}
        <div className="hidden lg:grid grid-cols-5 gap-4 mt-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;

            return (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`p-6 rounded-xl transition-all duration-300 text-left ${
                  isActive
                    ? "bg-secondary wb-shadow-card scale-105"
                    : "bg-transparent hover:bg-secondary/50"
                }`}
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 ${
                  isActive ? "wb-shadow-soft" : "opacity-60"
                }`}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className={`font-semibold mb-1 transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm transition-colors ${
                  isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}>
                  {step.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
