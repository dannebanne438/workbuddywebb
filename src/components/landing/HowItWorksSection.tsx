import { Reveal, fadeUp, staggerContainer } from "./animations";
import { motion } from "framer-motion";

export const HowItWorksSection = () => {
  const problems = [
  {
    number: "01",
    title: "Informationen försvinner",
    body: "Rutiner i Messenger-trådar. Schema i Excel. Kontaktlistor i en pärm. Ny personal hittar ingenting."
  },
  {
    number: "02",
    title: "Chefer avbryts konstant",
    body: "Samma frågor, varje kväll. \"Vem jobbar imorgon?\" \"Var finns nyckeln?\" \"Vad gör jag vid larm?\""
  },
  {
    number: "03",
    title: "Ingen spårbarhet",
    body: "Ingen vet vem som läst vad. Checklistor bockas av på papper. Avvikelser rapporteras via SMS."
  }];


  return (
    <section className="landing-section bg-muted/30 border-t border-border">
      <div className="landing-container">
        <Reveal>
          <div className="mb-16">
            <div className="landing-badge mb-4">Problem</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">Internkommunikationen i företag är trasig

            </h2>
            <p className="text-muted-foreground text-base max-w-xl">
              De flesta arbetsplatser kör fortfarande på Messenger, papperslistor och mejlkedjor.
            </p>
          </div>
        </Reveal>

        <motion.div
          className="grid sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}>
          
          {problems.map((item, i) =>
          <motion.div
            key={item.number}
            variants={fadeUp}
            custom={i}
            className="bg-background p-8 sm:p-10 group hover:bg-muted/20 transition-colors duration-300">
            
              <span className="text-xs font-mono text-primary/60 mb-4 block">{item.number}</span>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{item.body}</p>
            </motion.div>
          )}
        </motion.div>

        <Reveal className="mt-16 max-w-2xl">
          <p className="text-base text-foreground leading-relaxed">
            WorkBuddy ersätter kaos med kontroll. En digital arbetsplattform där all information samlas,
            alla vet vad som gäller, och chefer äntligen kan fokusera på det som faktiskt spelar roll.
          </p>
        </Reveal>
      </div>
    </section>);

};