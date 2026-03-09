import { motion } from "framer-motion";
import { Reveal, Parallax, Float, fadeUp } from "./animations";
import { MobileScreen } from "./ProductScreens";

export const ProductShowcase = () => {
  return (
    <section className="py-20 lg:py-28 bg-background border-t border-border relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="landing-container relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div className="landing-badge mb-4">Mobil-först</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Hela arbetsplatsen i fickan
            </h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Personalen kommer åt schema, rutiner och checklistor direkt i mobilen – oavsett var de befinner sig.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Mobile phone */}
          <Reveal>
            <Float delay={0}>
              <MobileScreen />
            </Float>
          </Reveal>

          {/* Feature highlights */}
          <Reveal custom={1}>
            <div className="max-w-sm space-y-6">
              {[
                {
                  title: "Push-notiser",
                  desc: "Få besked direkt vid nya meddelanden, schemaändringar eller avvikelser.",
                },
                {
                  title: "Offline-läsning",
                  desc: "Rutiner och kontaktinfo tillgängligt även utan uppkoppling.",
                },
                {
                  title: "Snabb rapportering",
                  desc: "Fotografera, rapportera och dokumentera – allt med tidsstämpel.",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="group"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
