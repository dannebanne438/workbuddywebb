import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="landing-container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md wb-gradient-accent">
              <span className="text-[10px] font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-[13px] font-medium text-foreground">WorkBuddy</span>
          </div>

          <nav className="flex items-center gap-5 text-[12px] text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Logga in</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Integritetspolicy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Villkor</Link>
            <Link to="/gdpr" className="hover:text-foreground transition-colors">GDPR</Link>
          </nav>

          <p className="text-[12px] text-muted-foreground">
            © {currentYear} WorkBuddy
          </p>
        </div>
      </div>
    </footer>
  );
};
