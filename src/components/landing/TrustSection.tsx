import { Building, Shield, Sparkles } from "lucide-react";

const trustPoints = [
  {
    icon: Building,
    title: "Byggd för riktiga arbetsplatser",
    description: "Designad för skiftarbete, rutiner och verklig drift.",
  },
  {
    icon: Shield,
    title: "Platsbaserad säkerhet",
    description: "All data är strikt isolerad per arbetsplats.",
  },
  {
    icon: Sparkles,
    title: "AI som jobbar – inte bara pratar",
    description: "Skapar schema, checklistor och svarar på frågor.",
  },
];

export const TrustSection = () => {
  return (
    <section className="py-20 lg:py-28 wb-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="text-center space-y-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {point.title}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
