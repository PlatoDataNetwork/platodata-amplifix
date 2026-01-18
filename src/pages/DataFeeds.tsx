import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Rss, FileJson, TrendingUp, List } from "lucide-react";

const SITE_URL = "https://www.platodata.io";

// Popular verticals to feature at the top
const POPULAR_VERTICALS = ["artificial-intelligence", "blockchain", "finance", "gaming"];

const DataFeeds = () => {
  const { siteName } = useSiteSettings();
  const pageTitle = `Data Feeds | ${siteName}`;
  const pageDescription = `Subscribe to ${siteName} RSS and JSON feeds for AI, Web3, and emerging technology news. Get real-time updates in your favorite feed reader.`;

  // Fetch unique verticals using RPC function
  const { data: verticals, isLoading } = useQuery({
    queryKey: ["feed-verticals"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_article_verticals");
      if (error) throw error;
      return (data as { vertical_slug: string }[])?.map((v) => v.vertical_slug) || [];
    },
  });

  const formatVerticalName = (slug: string) => {
    if (slug === "ar-vr") return "AR/VR";
    if (slug === "artificial-intelligence") return "AI";
    
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getFeedUrl = (vertical: string, type: "rss" | "json") => {
    const baseUrl = `${SITE_URL}/feed`;
    return type === "rss" ? `${baseUrl}/${vertical}.xml` : `${baseUrl}/${vertical}.json`;
  };

  const getContentUrl = (vertical: string) => {
    return `/w3ai/vertical/${vertical}`;
  };

  // Split verticals into popular and all categories
  const popularVerticals = verticals?.filter((v) => POPULAR_VERTICALS.includes(v)) || [];
  const allVerticals = verticals || [];

  const FeedCard = ({ vertical }: { vertical: string }) => (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all duration-300">
      <h3 className="text-lg font-bold text-foreground mb-4">
        {formatVerticalName(vertical)}
      </h3>
      <div className="flex items-center gap-4">
        <Link
          to={getContentUrl(vertical)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Content
        </Link>
        <a
          href={getFeedUrl(vertical, "rss")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-400 transition-colors"
        >
          <Rss className="w-4 h-4" />
          RSS
        </a>
        <a
          href={getFeedUrl(vertical, "json")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          <FileJson className="w-4 h-4" />
          JSON
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/data-feeds`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${SITE_URL}/data-feeds`} />
        
        {/* Feed autodiscovery */}
        <link rel="alternate" type="application/rss+xml" title={`${siteName} RSS Feed`} href={`${SITE_URL}/feed.xml`} />
        <link rel="alternate" type="application/json" title={`${siteName} JSON Feed`} href={`${SITE_URL}/feed.json`} />
      </Helmet>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            Data Feeds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Subscribe to our RSS and JSON feeds to get real-time updates on AI, Web3, and emerging technology news.
          </p>
        </div>
      </section>

      {/* Popular Feeds Section */}
      {popularVerticals.length > 0 && (
        <section className="px-6 pb-12">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Popular Feeds</h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularVerticals.map((vertical) => (
                  <FeedCard key={vertical} vertical={vertical} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Feeds by Categories Section */}
      <section className="px-6 pb-20">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <List className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Feeds by Categories</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : allVerticals.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No feeds available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allVerticals.map((vertical) => (
                <FeedCard key={vertical} vertical={vertical} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DataFeeds;
