import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg wb-gradient-accent">
              <span className="text-sm font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-lg font-semibold text-foreground">WorkBuddy</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Logga in
            </Link>
            <button
              onClick={scrollToContact}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Kontakta oss
            </button>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Integritetspolicy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Användarvillkor
            </Link>
            <Link to="/gdpr" className="text-muted-foreground hover:text-foreground transition-colors">
              GDPR
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} WorkBuddy
          </p>
        </div>
      </div>
    </footer>
  );
};
