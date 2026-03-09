import { 
  MessageSquare, 
  Calendar, 
  ClipboardList, 
  Book, 
  Users, 
  Bell,
  Clock,
  Phone,
  Shield
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI-assistent",
    description: "Svara på frågor om rutiner, regler och arbetsplatsen – dygnet runt.",
  },
  {
    icon: Calendar,
    title: "Schemavisning",
    description: "Alla ser sitt schema och kan hålla koll på kommande pass.",
  },
  {
    icon: ClipboardList,
    title: "Checklistor",
    description: "Dagliga uppgifter som bockas av i realtid – synligt för alla.",
  },
  {
    icon: Book,
    title: "Rutiner & SOPs",
    description: "All dokumentation samlad på ett ställe, lättillgänglig.",
  },
  {
    icon: Bell,
    title: "Meddelanden",
    description: "Skicka ut info till hela teamet eller enskilda medarbetare.",
  },
  {
    icon: Users,
    title: "Team-chat",
    description: "Enkel kommunikation mellan kollegor på arbetsplatsen.",
  },
  {
    icon: Clock,
    title: "Viktiga tider",
    description: "Öppettider, leveranstider och viktiga tidpunkter samlade.",
  },
  {
    icon: Phone,
    title: "Kontaktlista",
    description: "Snabb åtkomst till alla viktiga kontakter.",
  },
  {
    icon: Shield,
    title: "Adminpanel",
    description: "Chefer har full kontroll över innehåll och personal.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary mb-2 block">
            Allt på en plats
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Samla internkommunikation och personalinformation på ett ställe
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            WorkBuddy är ett komplett verktyg för företagskommunikation och personalhantering – schema, rutiner, checklistor och AI-stöd i en och samma plattform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:wb-shadow-card transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
