import { CheckCircle2, TrendingDown, Clock, Users } from "lucide-react";

const benefits = [
  {
    icon: TrendingDown,
    stat: "70%",
    title: "Färre avbrott",
    description: "Chefer slipper svara på samma frågor om och om igen.",
  },
  {
    icon: Clock,
    stat: "24/7",
    title: "Alltid tillgänglig",
    description: "WorkBuddy svarar dygnet runt – även på helger och kvällar.",
  },
  {
    icon: Users,
    stat: "100%",
    title: "Enhetlig info",
    description: "Alla får samma svar – ingen risk för missförstånd.",
  },
  {
    icon: CheckCircle2,
    stat: "0",
    title: "Papperslistor",
    description: "Ersätt pärmar och papperslappar med digitala checklistor.",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary mb-2 block">
            Mätbara fördelar
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Varför arbetsplatser väljer WorkBuddy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mindre krångel, mer struktur – och nöjdare personal.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="text-center p-6"
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2 wb-gradient-accent bg-clip-text text-transparent">
                  {benefit.stat}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
