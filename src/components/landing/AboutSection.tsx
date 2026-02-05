import { Shield, Calendar, Users } from "lucide-react";

const experiences = [
  {
    icon: Shield,
    title: "Säkerhetsbranschen",
    description:
      "Vi har själva svarat på samma frågor varje kväll: 'Vad gör jag om larmet går?' 'Vem ringer jag vid en incident?'",
  },
  {
    icon: Calendar,
    title: "Event & bemanning",
    description:
      "Vi har upplevt kaoset när schemat ändras i sista minuten och ingen vet vem som faktiskt jobbar.",
  },
  {
    icon: Users,
    title: "Vardagen på golvet",
    description:
      "Vi har sett hur viktig info försvinner i Messenger-trådar, pärmar som ingen hittar, och chefer som aldrig får vara ifred.",
  },
];

export const AboutSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary mb-2 block">
            Om oss
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Byggt av människor som förstår
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            WorkBuddy skapades inte på ett kontor långt från verkligheten — utan
            av ett team som själva har stått i receptionen, sprungit ronder och
            koordinerat event.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {experiences.map((exp, index) => {
            const Icon = exp.icon;
            return (
              <div
                key={index}
                className="bg-background rounded-2xl p-6 border border-border"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {exp.title}
                </h3>
                <p className="text-muted-foreground">{exp.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-xl text-foreground font-medium max-w-2xl mx-auto">
            "Därför byggde vi WorkBuddy — en digital kollega som alltid finns
            där, alltid vet svaret, och aldrig tar semester."
          </p>
        </div>
      </div>
    </section>
  );
};
