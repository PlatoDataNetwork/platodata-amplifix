import { Brain, Hexagon, Code, Zap, Shield, Cpu, Database, Globe, Rocket } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLangRouting } from "@/hooks/useLangRouting";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import useTranslations from "@/hooks/useTranslations";

const SITE_URL = "https://www.platodata.io";

const Solutions = () => {
  const { siteName } = useSiteSettings();
  const { withLang } = useLangRouting();
  const { t, getArray } = useTranslations();
  
  const pageTitle = `Solutions | AI, Web3 & Software Development | ${siteName}`;
  const pageDescription = "Empowering businesses with innovative technology solutions across AI development, Web3 blockchain solutions, and custom software development.";
  
  const solutions = [
    {
      id: "ai-development",
      icon: Brain,
      title: t("solutions.aiDevelopment.title"),
      tagline: t("solutions.aiDevelopment.tagline"),
      description: t("solutions.aiDevelopment.description"),
      features: [
        {
          icon: Cpu,
          title: t("solutions.aiDevelopment.features.mlModels.title"),
          description: t("solutions.aiDevelopment.features.mlModels.description")
        },
        {
          icon: Brain,
          title: t("solutions.aiDevelopment.features.nlp.title"),
          description: t("solutions.aiDevelopment.features.nlp.description")
        },
        {
          icon: Database,
          title: t("solutions.aiDevelopment.features.computerVision.title"),
          description: t("solutions.aiDevelopment.features.computerVision.description")
        },
        {
          icon: Rocket,
          title: t("solutions.aiDevelopment.features.aiIntegration.title"),
          description: t("solutions.aiDevelopment.features.aiIntegration.description")
        }
      ],
      benefits: getArray("solutions.aiDevelopment.benefits")
    },
    {
      id: "web3-development",
      icon: Hexagon,
      title: t("solutions.web3Development.title"),
      tagline: t("solutions.web3Development.tagline"),
      description: t("solutions.web3Development.description"),
      features: [
        {
          icon: Hexagon,
          title: t("solutions.web3Development.features.smartContracts.title"),
          description: t("solutions.web3Development.features.smartContracts.description")
        },
        {
          icon: Shield,
          title: t("solutions.web3Development.features.defi.title"),
          description: t("solutions.web3Development.features.defi.description")
        },
        {
          icon: Globe,
          title: t("solutions.web3Development.features.nft.title"),
          description: t("solutions.web3Development.features.nft.description")
        },
        {
          icon: Database,
          title: t("solutions.web3Development.features.infrastructure.title"),
          description: t("solutions.web3Development.features.infrastructure.description")
        }
      ],
      benefits: getArray("solutions.web3Development.benefits")
    },
    {
      id: "software-development",
      icon: Code,
      title: t("solutions.softwareDevelopment.title"),
      tagline: t("solutions.softwareDevelopment.tagline"),
      description: t("solutions.softwareDevelopment.description"),
      features: [
        {
          icon: Code,
          title: t("solutions.softwareDevelopment.features.fullStack.title"),
          description: t("solutions.softwareDevelopment.features.fullStack.description")
        },
        {
          icon: Zap,
          title: t("solutions.softwareDevelopment.features.api.title"),
          description: t("solutions.softwareDevelopment.features.api.description")
        },
        {
          icon: Database,
          title: t("solutions.softwareDevelopment.features.database.title"),
          description: t("solutions.softwareDevelopment.features.database.description")
        },
        {
          icon: Shield,
          title: t("solutions.softwareDevelopment.features.securityCompliance.title"),
          description: t("solutions.softwareDevelopment.features.securityCompliance.description")
        }
      ],
      benefits: getArray("solutions.softwareDevelopment.benefits")
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/solutions`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@PlatoDataIO" />
        <meta name="twitter:url" content={`${SITE_URL}/solutions`} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${SITE_URL}/solutions`} />
      </Helmet>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {t("solutions.pageTitle")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("solutions.pageDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Details */}
      {solutions.map((solution, index) => {
        const Icon = solution.icon;
        return (
          <section 
            key={solution.id} 
            id={solution.id}
            className={`py-20 relative ${index % 2 === 1 ? 'bg-card/30' : ''}`}
          >
            <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto">
                {/* Solution Header */}
                <div className="flex items-center gap-4 mb-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold">{solution.title}</h2>
                    <p className="text-primary text-lg mt-1">{solution.tagline}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg text-muted-foreground mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  {solution.description}
                </p>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {solution.features.map((feature, featureIndex) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div 
                        key={featureIndex}
                        className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${0.2 + featureIndex * 0.1}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FeatureIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Benefits */}
                <div className="p-8 rounded-xl bg-card border border-border animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <h3 className="text-xl font-semibold mb-4">{t("solutions.keyBenefits")}</h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {solution.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-8 flex gap-4 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    {t("solutions.getStarted")}
                  </Button>
                  <Button size="lg" variant="outline">
                    {t("solutions.scheduleConsultation")}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Back to Home */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 text-center">
          <Link to={withLang("/")}>
            <Button variant="ghost" size="lg">
              {t("solutions.backToHome")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;
