import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Innan WorkBuddy ringde personalen mig på kvällarna med frågor. Nu svarar systemet – och jag kan fokusera på det som är viktigt.",
    author: "Anna Lindberg",
    role: "Platschef, Säkerhetsbranschen",
    initials: "AL",
  },
  {
    quote: "Nya medarbetare kommer igång mycket snabbare nu. De kan fråga WorkBuddy istället för att känna sig osäkra.",
    author: "Erik Johansson",
    role: "Restaurangchef",
    initials: "EJ",
  },
  {
    quote: "Checklistorna har minskat våra misstag markant. Alla vet vad som ska göras och kan bocka av i realtid.",
    author: "Maria Svensson",
    role: "Butikschef, Detaljhandel",
    initials: "MS",
  },
];

export const TestimonialSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent mb-2 block">
            Från våra kunder
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Vad säger de som använder WorkBuddy?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-background border border-border"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full wb-gradient-accent flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {testimonial.initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
