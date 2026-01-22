import { Code2, GitBranch, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLangRouting } from "@/hooks/useLangRouting";
import useTranslations from "@/hooks/useTranslations";

const Developers = () => {
  const { withLang } = useLangRouting();
  const { t } = useTranslations();

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8 mb-16">
          <p className="text-primary text-sm font-medium tracking-wide uppercase">{t("developers.badge")}</p>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
            {t("developers.titleLine1")}
            <br />
            {t("developers.titleLine2")}
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t("developers.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Code2 className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">{t("developers.items.cleanApis.title")}</h3>
            <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
              {t("developers.items.cleanApis.description")}
            </p>
            <Link to={withLang("/solutions")} className="w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
              >
                {t("developers.learnMore")}
              </Button>
            </Link>
          </div>

          <div
            className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <GitBranch className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">{t("developers.items.versionControl.title")}</h3>
            <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
              {t("developers.items.versionControl.description")}
            </p>
            <Link to={withLang("/solutions")} className="w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
              >
                {t("developers.learnMore")}
              </Button>
            </Link>
          </div>

          <div
            className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Terminal className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">{t("developers.items.cliTools.title")}</h3>
            <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
              {t("developers.items.cliTools.description")}
            </p>
            <Link to={withLang("/solutions")} className="w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
              >
                {t("developers.learnMore")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Developers;
