import useTranslations from "@/hooks/useTranslations";

const Stats = () => {
  const { t } = useTranslations();

  const stats = [
    { value: "35+", label: t("stats.items.languages") },
    { value: "200M+", label: t("stats.items.impressions") },
    { value: "13M+", label: t("stats.items.engagements") },
    { value: "70K+", label: t("stats.items.enterprises") },
  ];

  return (
    <section className="py-32 relative" id="protocol">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <p className="text-primary text-sm font-medium tracking-wide uppercase">
              {t("stats.badge")}
            </p>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
              {t("stats.titleLine1")}
              <br />
              {t("stats.titleLine2")}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl md:text-6xl font-bold text-primary mb-3">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center pt-16">
            <h3 className="text-3xl font-bold mb-4">{t("stats.trustedTitle")}</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("stats.trustedDescription")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
