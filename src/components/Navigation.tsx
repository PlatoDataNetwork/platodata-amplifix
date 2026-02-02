import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import platoIcon from "@/assets/plato-icon.png";
import LanguageSelector from "@/components/LanguageSelector";
import { useLangRouting } from "@/hooks/useLangRouting";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { withLang } = useLangRouting();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Solutions", href: "/#solutions" },
    { name: "Protocol", href: "/#protocol" },
    { name: "Security", href: "/#security" },
    { name: "Resources", href: "/#resources" },
    { name: "Intel", href: "/intel", isRoute: true },
    { name: "Data Feeds", href: "/data-feeds", isRoute: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link
            to={withLang("/")}
            className="flex items-center space-x-2 md:space-x-3 cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)] notranslate"
            translate="no"
          >
            <img src={platoIcon} alt="Platodata" className="w-7 h-7 md:w-8 md:h-8" />
            <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground notranslate" translate="no">Platodata</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={withLang(link.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={withLang(link.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              ),
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Selector - Desktop */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              Staking
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs md:text-sm px-3 md:px-4">
              Token
            </Button>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-l border-border">
                <div className="flex flex-col h-full pt-8">
                  {/* Mobile Nav Links */}
                  <div className="flex flex-col space-y-1">
                    {navLinks.map((link) =>
                      link.isRoute ? (
                        <SheetClose asChild key={link.name}>
                          <Link
                            to={withLang(link.href)}
                            className="text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 px-4 py-3 rounded-lg transition-colors"
                          >
                            {link.name}
                          </Link>
                        </SheetClose>
                      ) : (
                        <SheetClose asChild key={link.name}>
                          <a
                            href={withLang(link.href)}
                            className="text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 px-4 py-3 rounded-lg transition-colors"
                          >
                            {link.name}
                          </a>
                        </SheetClose>
                      ),
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border my-4" />

                  {/* Mobile Actions */}
                  <div className="flex flex-col space-y-3 px-4">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Staking
                    </Button>
                    <Button size="sm" className="w-full justify-center bg-primary hover:bg-primary/90">
                      Token
                    </Button>
                  </div>

                  {/* Language Selector - Mobile */}
                  <div className="mt-6 px-4">
                    <p className="text-xs text-muted-foreground mb-2">Language</p>
                    <LanguageSelector />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
