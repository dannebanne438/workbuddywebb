import { Building2, Utensils, ShoppingBag, Factory, Hotel, Dumbbell } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    title: "Säkerhetsbolag",
    description: "Väktare får svar på rutiner, rondering och kontaktinfo direkt.",
    example: "\"Vad ska jag göra vid larm i byggnad C?\"",
  },
  {
    icon: Utensils,
    title: "Restauranger",
    description: "Kökspersonal och serveringspersonal får schema och checklista.",
    example: "\"Vem jobbar kväll idag?\"",
  },
  {
    icon: ShoppingBag,
    title: "Butiker",
    description: "Kassapersonal får öppningsrutiner och prisinfo snabbt.",
    example: "\"Hur gör vi vid reklamation?\"",
  },
  {
    icon: Factory,
    title: "Lager & logistik",
    description: "Lagerpersonal kan kolla leveranstider och säkerhetsrutiner.",
    example: "\"När kommer nästa leverans?\"",
  },
  {
    icon: Hotel,
    title: "Hotell",
    description: "Receptionen får städschema och gästinformation.",
    example: "\"Vilka rum ska städas först idag?\"",
  },
  {
    icon: Dumbbell,
    title: "Gym & Fitness",
    description: "Instruktörer och personal får passinfo och städrutiner.",
    example: "\"Vilka gruppträningar finns idag?\"",
  },
];

export const UseCasesSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent mb-2 block">
            Passar många branscher
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Verktyg för personalhantering i alla branscher
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oavsett bransch – om ni har pass, rutiner och personal som behöver snabb tillgång till information, är WorkBuddy rätt arbetsplattform för ert företag.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-background border border-border hover:border-accent/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl wb-gradient-accent flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {useCase.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {useCase.description}
                    </p>
                    <div className="bg-secondary rounded-lg px-3 py-2">
                      <p className="text-sm italic text-foreground/80">
                        {useCase.example}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
