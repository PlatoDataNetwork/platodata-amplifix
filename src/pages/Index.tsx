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
