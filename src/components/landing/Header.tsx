import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 wb-glass border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg wb-gradient-accent">
              <span className="text-lg font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-xl font-semibold text-foreground">WorkBuddy</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="nav" size="sm" onClick={scrollToContact}>
              Kontakta oss
            </Button>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="nav" size="sm" className="hidden sm:inline-flex" onClick={scrollToContact}>
              Kontakta oss
            </Button>
            <Button variant="hero" size="default" asChild>
              <Link to="/login">Logga in</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
