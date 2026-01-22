import useTranslations from "@/hooks/useTranslations";

const Mission = () => {
  const { t } = useTranslations();

  return (
    <section className="py-32 relative" id="about">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <p className="text-primary text-sm font-medium tracking-wide uppercase">
              {t("mission.badge")}
            </p>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
              {t("mission.title")}
            </h2>
          </div>
          
          <div className="bg-card border border-border rounded-3xl p-12 md:p-16 space-y-8">
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("mission.description")}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">{t("mission.feature1Title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("mission.feature1Description")}
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">{t("mission.feature2Title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("mission.feature2Description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
