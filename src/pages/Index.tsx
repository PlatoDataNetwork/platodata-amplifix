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

const SITE_URL = "https://www.platodata.io";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Plato AI - Secure Network Protocol for the Next Web</title>
        <meta name="description" content="Web3 AI code creation, automation, and vertical data intelligence. A decentralized, consensus-driven AI network ensuring trust & transparency." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Plato AI - Secure Network Protocol for the Next Web" />
        <meta property="og:description" content="Web3 AI code creation, automation, and vertical data intelligence. A decentralized, consensus-driven AI network ensuring trust & transparency." />
        <meta property="og:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        <meta property="og:site_name" content="Platodata" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@PlatoDataIO" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content="Plato AI - Secure Network Protocol for the Next Web" />
        <meta name="twitter:description" content="Web3 AI code creation, automation, and vertical data intelligence. A decentralized, consensus-driven AI network ensuring trust & transparency." />
        <meta name="twitter:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={SITE_URL} />
        
        {/* JSON-LD Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Plato Technologies Inc",
            "alternateName": "Platodata",
            "url": SITE_URL,
            "logo": `${SITE_URL}/favicon.png`,
            "description": "Web3 AI code creation, automation, and vertical data intelligence. A decentralized, consensus-driven AI network ensuring trust & transparency.",
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
            "name": "Platodata",
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
