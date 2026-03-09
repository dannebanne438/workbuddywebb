import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 wb-glass border-b border-border/60"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg wb-gradient-accent transition-transform group-hover:scale-105">
              <span className="text-sm font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">WorkBuddy</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-[13px] text-muted-foreground">
            <button onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-foreground transition-colors">Produkt</button>
            <button onClick={() => document.getElementById("use-cases")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-foreground transition-colors">Branscher</button>
            <button onClick={scrollToContact} className="hover:text-foreground transition-colors">Kontakt</button>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground hidden sm:inline-flex" asChild>
              <Link to="/login">Logga in</Link>
            </Button>
            <Button size="sm" className="text-[13px] h-8 px-3 rounded-lg group" onClick={scrollToContact}>
              Boka demo
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
