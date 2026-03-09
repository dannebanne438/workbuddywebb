import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardScreen } from "./ProductScreens";
import { Parallax, fadeUp } from "./animations";

export const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-28 pb-0 sm:pt-32 bg-background relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      <div className="landing-container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16 sm:mb-20"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.div variants={fadeUp} className="landing-badge mb-6">
            Plattform för internkommunikation
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-foreground leading-[1.08] tracking-tight mb-5"
          >
            Allt din arbetsplats behöver.{" "}
            <span className="bg-clip-text text-transparent wb-gradient-accent">
              Ett system.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8"
          >
            WorkBuddy samlar internkommunikation, personalhantering, schema och rutiner
            i en plattform – byggd för företag som vill ha kontroll.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <Button size="lg" className="rounded-lg h-11 px-6 text-sm group" onClick={scrollToContact}>
              Boka demo
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-lg h-11 px-6 text-sm" asChild>
              <Link to="/login">Logga in</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Product hero with parallax */}
        <Parallax offset={30} className="relative">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="relative">
              {/* Glow effect behind the mockup */}
              <div className="absolute -inset-10 bg-primary/5 rounded-[2rem] blur-3xl pointer-events-none" />
              <DashboardScreen className="relative" />
            </div>
          </motion.div>
        </Parallax>
      </div>
    </section>
  );
};
