import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const SITE_URL = "https://www.platodata.io";

const Intel = () => {
  const { siteName } = useSiteSettings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  
  const pageTitle = `${siteName} Intelligence | AI, Web3 & Emerging Tech News`;
  const pageDescription = `Stay updated with the latest AI, data intelligence, Web3, and emerging technologies news, insights, and intelligence from ${siteName}.`;
  
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
    if (slug === "artificial-intelligence") return "AI";
    
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleVerticalChange = (value: string) => {
    if (value !== "all") {
      navigate(`/w3ai/vertical/${value}`);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to first vertical with search query, or could implement global search
      navigate(`/w3ai/vertical/${verticals?.[0] || 'artificial-intelligence'}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Filter verticals based on search query for displaying
  const filteredVerticals = verticals?.filter((vertical) =>
    formatVerticalName(vertical).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/intel`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${SITE_URL}/intel`} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
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

      {/* Search, Filter & View Controls */}
      <section className="px-6 pb-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-24 bg-transparent border-border"
              />
              <Button onClick={handleSearch} size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8">
                Search
              </Button>
            </div>
            
            {/* Vertical Dropdown */}
            <Select value="all" onValueChange={handleVerticalChange}>
              <SelectTrigger className="w-full md:w-48 bg-transparent border-border">
                <SelectValue placeholder="All Verticals" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">All Verticals</SelectItem>
                {verticals?.map((v) => (
                  <SelectItem key={v} value={v}>
                    {formatVerticalName(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="rounded-none gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Verticals Grid */}
      <section className="px-6 pb-20">
        <div className="container mx-auto">
          {isLoading ? (
            <div className={viewMode === "cards" ? "grid grid-cols-2 md:grid-cols-4 gap-4" : "space-y-4"}>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className={viewMode === "cards" ? "h-32 w-full rounded-lg" : "h-16 w-full rounded-lg"} />
              ))}
            </div>
          ) : filteredVerticals?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No categories found.</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query.
                </p>
              )}
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredVerticals?.map((vertical) => (
                <Link 
                  key={vertical} 
                  to={`/w3ai/vertical/${vertical}`}
                  className="group"
                >
                  <div className="bg-transparent border border-border rounded-lg p-6 h-32 flex items-center justify-center hover:border-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary/70 transition-all duration-300 group-hover:text-white">
                    <span className="text-foreground font-bold text-2xl md:text-3xl text-center group-hover:text-white transition-colors">
                      {formatVerticalName(vertical)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVerticals?.map((vertical) => (
                <Link 
                  key={vertical} 
                  to={`/w3ai/vertical/${vertical}`}
                  className="group block"
                >
                  <div className="bg-transparent border border-border rounded-lg px-6 py-4 flex items-center justify-between hover:border-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary/70 transition-all duration-300 group-hover:text-white">
                    <span className="text-foreground font-bold text-xl group-hover:text-white transition-colors">
                      {formatVerticalName(vertical)}
                    </span>
                    <span className="text-muted-foreground text-sm group-hover:text-white/80 transition-colors">
                      View articles →
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
