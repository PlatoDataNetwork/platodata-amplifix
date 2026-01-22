import useTranslations from "@/hooks/useTranslations";

const Hero = () => {
  const { t } = useTranslations();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Content */}
      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-4">
            {t("hero.badge")}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-[-0.02em] leading-[1.1]" style={{ fontWeight: 700 }}>
            <span className="whitespace-nowrap">{t("hero.titleLine1")}</span>
            <br />
            <span className="whitespace-nowrap">{t("hero.titleLine2")}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("hero.descriptionLine1")}
            <br />
            <span className="whitespace-nowrap">{t("hero.descriptionLine2")}</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
