import { Link } from "react-router-dom";
import platoIcon from "@/assets/plato-icon.png";
import { useLangRouting } from "@/hooks/useLangRouting";
import useTranslations from "@/hooks/useTranslations";

const Footer = () => {
  const { withLang } = useLangRouting();
  const { t } = useTranslations();

  return (
    <footer className="py-20 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <Link
                to={withLang("/")}
                className="flex items-center space-x-3 mb-6 cursor-pointer hover:opacity-80 transition-opacity notranslate"
                translate="no"
              >
                <img src={platoIcon} alt="Platodata" className="w-8 h-8" />
                <span className="text-2xl font-bold tracking-tight text-foreground notranslate" translate="no">Platodata</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("footer.companyDescription")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("footer.productTitle")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href={withLang("/#solutions")} className="hover:text-foreground transition-colors">
                    {t("navigation.solutions")}
                  </a>
                </li>
                <li>
                  <a href={withLang("/#protocol")} className="hover:text-foreground transition-colors">
                    {t("navigation.protocol")}
                  </a>
                </li>
                <li>
                  <a href={withLang("/#security")} className="hover:text-foreground transition-colors">
                    {t("navigation.security")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("footer.companyTitle")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href={withLang("/#about")} className="hover:text-foreground transition-colors">
                    {t("navigation.about")}
                  </a>
                </li>
                <li>
                  <a href={withLang("/#resources")} className="hover:text-foreground transition-colors">
                    {t("footer.blog")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    {t("footer.careers")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("footer.connectTitle")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    {t("footer.twitter")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    {t("footer.discord")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    {t("footer.github")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">{t("footer.copyright")}</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                {t("footer.privacyPolicy")}
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                {t("footer.termsOfService")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
