import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Mission from "@/components/Mission";
import Security from "@/components/Security";
import Stats from "@/components/Stats";
import Developers from "@/components/Developers";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <Mission />
      <Security />
      <Stats />
      <Developers />
      <Blog />
      <Footer />
    </div>
  );
};

export default Index;
