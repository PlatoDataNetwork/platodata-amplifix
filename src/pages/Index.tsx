import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Mission from "@/components/Mission";
import Security from "@/components/Security";
import Stats from "@/components/Stats";
import Developers from "@/components/Developers";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SITE_URL = "https://www.platodata.io";

const Index = () => {
  const { siteName, siteDescription } = useSiteSettings();
  const pageTitle = `${siteName} - Secure Network Protocol for the Next Web`;
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={siteDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@PlatoDataIO" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={SITE_URL} />
        
        {/* JSON-LD Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "alternateName": siteName,
            "url": SITE_URL,
            "logo": `${SITE_URL}/favicon.png`,
            "description": siteDescription,
            "sameAs": [
              "https://twitter.com/PlatoDataIO"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "url": SITE_URL
            },
            "founder": {
              "@type": "Organization",
              "name": "Plato Technologies Inc"
            },
            "knowsAbout": [
              "Artificial Intelligence",
              "Web3",
              "Blockchain",
              "Data Intelligence",
              "Decentralized Networks"
            ]
          })}
        </script>
        
        {/* JSON-LD WebSite Schema for Sitelinks Search */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": SITE_URL,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${SITE_URL}/intel?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <Navigation />
      <Hero />
      <Developers />
      <Features />
      <Mission />
      <Security />
      <Stats />
      <Blog />
      <Footer />
    </div>
  );
};

export default Index;
