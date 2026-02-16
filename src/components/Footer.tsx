import { Link } from "react-router-dom";
import platoIcon from "@/assets/plato-icon.png";
import { useLangRouting } from "@/hooks/useLangRouting";

const Footer = () => {
  const { withLang } = useLangRouting();

  return (
    <footer className="py-12 md:py-20 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link
                to={withLang("/")}
                className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6 cursor-pointer hover:opacity-80 transition-opacity notranslate"
                translate="no"
              >
                <img src={platoIcon} alt="Platodata" className="w-7 h-7 md:w-8 md:h-8" />
                <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground notranslate" translate="no">Platodata</span>
              </Link>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Plato Technologies Inc. A NYC based AI Web3 Venture Lab dedicated to building
                vertically focused data intelligence products.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Product</h4>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                <li>
                  <a href={withLang("/#solutions")} className="hover:text-foreground transition-colors">
                    Solutions
                  </a>
                </li>
                <li>
                  <a href={withLang("/#protocol")} className="hover:text-foreground transition-colors">
                    Protocol
                  </a>
                </li>
                <li>
                  <a href={withLang("/#security")} className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                <li>
                  <a href={withLang("/#about")} className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href={withLang("/#resources")} className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Connect</h4>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/PlatoDataIntelligence" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">© 2024 Plato Technologies Inc. All rights reserved.</p>
            <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
