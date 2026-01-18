import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import platoIcon from "@/assets/plato-icon.png";
import LanguageSelector from "@/components/LanguageSelector";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Solutions", href: "#solutions" },
    { name: "Protocol", href: "#protocol" },
    { name: "Security", href: "#security" },
    { name: "Resources", href: "#resources" },
    { name: "Intel", href: "/intel", isRoute: true },
    { name: "Data Feeds", href: "/data-feeds", isRoute: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]">
            <img src={platoIcon} alt="Platodata" className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight text-foreground">Platodata</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              Staking
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Token
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
