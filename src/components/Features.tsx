import { Zap, Box, FileCode2, Users, Shield, Plug, Brain, Hexagon, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLangRouting } from "@/hooks/useLangRouting";
import useTranslations from "@/hooks/useTranslations";

const Features = () => {
  const { withLang } = useLangRouting();
  const { t } = useTranslations();

  const features = [
    {
      icon: Brain,
      title: t("features.items.aiDevelopment.title"),
      description: t("features.items.aiDevelopment.description"),
    },
    {
      icon: Hexagon,
      title: t("features.items.web3Development.title"),
      description: t("features.items.web3Development.description"),
    },
    {
      icon: Code,
      title: t("features.items.softwareDevelopment.title"),
      description: t("features.items.softwareDevelopment.description"),
    },
    {
      icon: Zap,
      title: t("features.items.fastSeamless.title"),
      description: t("features.items.fastSeamless.description"),
    },
    {
      icon: Box,
      title: t("features.items.uniqueFunctionality.title"),
      description: t("features.items.uniqueFunctionality.description"),
    },
    {
      icon: FileCode2,
      title: t("features.items.smartContracts.title"),
      description: t("features.items.smartContracts.description"),
    },
    {
      icon: Users,
      title: t("features.items.communityIntegration.title"),
      description: t("features.items.communityIntegration.description"),
    },
    {
      icon: Shield,
      title: t("features.items.secureTransparent.title"),
      description: t("features.items.secureTransparent.description"),
    },
    {
      icon: Plug,
      title: t("features.items.apiFunctionality.title"),
      description: t("features.items.apiFunctionality.description"),
    },
  ];

  return (
    <section className="py-32 relative" id="solutions">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight mb-4">{t("features.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("features.description")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">{feature.description}</p>
                {index < 3 ? (
                  <Link to={withLang("/solutions")} className="w-full">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
                    >
                      {t("features.learnMore")}
                    </Button>
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
