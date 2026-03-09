import { motion } from "framer-motion";
import { Reveal, fadeUp, staggerContainer } from "./animations";
import { useCountUp } from "@/hooks/useCountUp";
import { useRef, useState, useEffect } from "react";

const AnimatedStat = ({ value, suffix = "" }: { value: string; suffix?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
  const count = useCountUp(numericValue, 1500, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const display = value === "24/7" ? "24/7" : value === "0" ? "0" : `${count}${suffix}`;

  return (
    <div ref={ref} className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tighter mb-2">
      {display}
    </div>
  );
};

export const BenefitsSection = () => {
  const stats = [
    { stat: "70", suffix: "%", label: "Färre avbrott", detail: "Chefer slipper svara på samma frågor om och om igen." },
    { stat: "24/7", suffix: "", label: "Alltid tillgänglig", detail: "Personalen får svar dygnet runt – även helger och kvällar." },
    { stat: "100", suffix: "%", label: "Enhetlig info", detail: "Alla får samma svar. Ingen risk för missförstånd." },
    { stat: "0", suffix: "", label: "Papperslistor", detail: "Ersätt pärmar och lappar med digitala checklistor." },
  ];

  return (
    <section className="landing-section bg-muted/30 border-t border-border">
      <div className="landing-container">
        <Reveal>
          <div className="mb-16">
            <div className="landing-badge mb-4">Resultat</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Förbättra kommunikationen med anställda – mätbart
            </h2>
          </div>
        </Reveal>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {stats.map((b, i) => (
            <motion.div key={b.label} variants={fadeUp} custom={i} className="group">
              <AnimatedStat value={b.stat} suffix={b.suffix} />
              <div className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                {b.label}
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{b.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
