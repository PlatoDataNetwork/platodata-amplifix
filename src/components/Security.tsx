import { Lock, Database, FileCheck, Shield } from "lucide-react";
import useTranslations from "@/hooks/useTranslations";

const Security = () => {
  const { t } = useTranslations();

  return (
    <section className="py-32 relative" id="security">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-32">
          {/* Multi-Layer Security */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-primary text-sm font-medium tracking-wide uppercase">
                {t("security.section1.badge")}
              </p>
              <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
                {t("security.section1.title")}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t("security.section1.description")}
              </p>
              
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("security.section1.feature1Title")}</h4>
                    <p className="text-muted-foreground text-sm">{t("security.section1.feature1Description")}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("security.section1.feature2Title")}</h4>
                    <p className="text-muted-foreground text-sm">{t("security.section1.feature2Description")}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("security.section1.feature3Title")}</h4>
                    <p className="text-muted-foreground text-sm">{t("security.section1.feature3Description")}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Shield className="w-48 h-48 text-primary/30" />
              </div>
            </div>
          </div>

          {/* Digital Watermarking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <FileCheck className="w-48 h-48 text-primary/30" />
              </div>
            </div>
            
            <div className="space-y-6 order-1 lg:order-2">
              <p className="text-primary text-sm font-medium tracking-wide uppercase">
                {t("security.section2.badge")}
              </p>
              <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
                {t("security.section2.title")}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t("security.section2.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
