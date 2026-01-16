import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.platodata.io";

const Intel = () => {
  // Fetch unique verticals using RPC function
  const { data: verticals, isLoading } = useQuery({
    queryKey: ["intel-verticals"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_article_verticals");
      if (error) throw error;
      return (data as { vertical_slug: string }[])?.map((v) => v.vertical_slug) || [];
    },
  });

  const formatVerticalName = (slug: string) => {
    // Handle special cases
    if (slug === "ar-vr") return "AR/VR";
    
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Platodata Intelligence | AI, Web3 & Emerging Tech News</title>
        <meta name="description" content="Stay updated with the latest AI, data intelligence, Web3, and emerging technologies news, insights, and intelligence from Platodata." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/intel`} />
        <meta property="og:title" content="Platodata Intelligence | AI, Web3 & Emerging Tech News" />
        <meta property="og:description" content="Stay updated with the latest AI, data intelligence, Web3, and emerging technologies news, insights, and intelligence from Platodata." />
        <meta property="og:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        <meta property="og:site_name" content="Platodata" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${SITE_URL}/intel`} />
        <meta name="twitter:title" content="Platodata Intelligence | AI, Web3 & Emerging Tech News" />
        <meta name="twitter:description" content="Stay updated with the latest AI, data intelligence, Web3, and emerging technologies news, insights, and intelligence from Platodata." />
        <meta name="twitter:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${SITE_URL}/intel`} />
      </Helmet>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            Platodata Intelligence
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest AI, data intelligence, Web3, and emerging technologies news, insights, and intelligence.
          </p>
        </div>
      </section>

      {/* Verticals Grid */}
      <section className="px-6 pb-20">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : verticals?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No verticals found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {verticals?.map((vertical) => (
                <Link 
                  key={vertical} 
                  to={`/w3ai/vertical/${vertical}`}
                  className="group"
                >
                  <div className="bg-transparent border border-border rounded-lg p-6 h-32 flex items-center justify-center hover:border-primary/50 hover:bg-primary transition-all duration-300">
                    <span className="text-foreground font-bold text-xl md:text-2xl text-center group-hover:text-primary transition-colors">
                      {formatVerticalName(vertical)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Intel;
