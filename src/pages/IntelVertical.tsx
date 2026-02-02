import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useLangRouting } from "@/hooks/useLangRouting";
import { ArrowRight, ChevronLeft, ChevronRight, Search, LayoutGrid, List } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const ARTICLES_PER_PAGE = 24;
const DEFAULT_ARTICLE_IMAGE = "/images/article-default-img.jpg";
const SITE_URL = "https://www.platodata.io";

const IntelVertical = () => {
  const { siteName } = useSiteSettings();
  const { vertical } = useParams<{ vertical: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { withLang } = useLangRouting();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeSearch, setActiveSearch] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Fetch unique verticals using RPC function
  const { data: verticals } = useQuery({
    queryKey: ["intel-verticals"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_article_verticals");
      if (error) throw error;
      return (data as { vertical_slug: string }[])?.map((v) => v.vertical_slug) || [];
    },
  });

  // Fetch total count for pagination
  const { data: totalCount } = useQuery({
    queryKey: ["intel-vertical-count", vertical, activeSearch],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("vertical_slug", vertical);
      
      if (activeSearch) {
        query = query.ilike("title", `%${activeSearch}%`);
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    enabled: !!vertical,
  });

  // Fetch paginated articles for vertical page
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["intel-vertical-articles", vertical, currentPage, activeSearch],
    queryFn: async () => {
      const from = (currentPage - 1) * ARTICLES_PER_PAGE;
      const to = from + ARTICLES_PER_PAGE - 1;
      
      let query = supabase
        .from("articles")
        .select("*")
        .eq("vertical_slug", vertical)
        .order("published_at", { ascending: false });
      
      if (activeSearch) {
        query = query.ilike("title", `%${activeSearch}%`);
      }
      
      const { data, error } = await query.range(from, to);
      if (error) throw error;
      return data;
    },
    enabled: !!vertical,
  });

  const totalPages = Math.ceil((totalCount || 0) / ARTICLES_PER_PAGE);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const goToPage = (page: number) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    setActiveSearch(searchQuery);
    updateParams({ q: searchQuery, page: "1" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVerticalChange = (value: string) => {
    if (value === "all") {
      navigate(withLang("/intel"));
    } else {
      navigate(withLang(`/w3ai/vertical/${value}`));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatVerticalName = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const generateArticleUrl = (article: { title: string; post_id: number | null; vertical_slug: string }) => {
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return withLang(`/w3ai/${article.post_id}/${article.vertical_slug}/${titleSlug}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const verticalName = formatVerticalName(vertical || "");
  const pageTitle = `${verticalName} Intelligence | ${siteName}`;
  const pageDescription = `Stay updated with the latest ${verticalName} news, insights, and intelligence from ${siteName}.`;
  const pageUrl = `${SITE_URL}/intel/${vertical}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/images/article-default-img.jpg`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={pageUrl} />
      </Helmet>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-6 md:pb-8 px-4 md:px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-6xl font-bold text-primary mb-3 md:mb-4">
            {formatVerticalName(vertical || "")} Intelligence
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Stay updated with the latest {formatVerticalName(vertical || "")} news, insights, and intelligence.
          </p>
        </div>
      </section>

      {/* Search, Filter & View Controls */}
      <section className="px-4 md:px-6 pb-6 md:pb-8">
        <div className="container mx-auto">
          <div className="flex flex-col gap-3 md:gap-4 items-stretch">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-lg md:mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-20 md:pr-24 bg-transparent border-border text-sm md:text-base"
              />
              <Button onClick={handleSearch} size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3">
                Search
              </Button>
            </div>
            
            {/* Filters Row */}
            <div className="flex gap-2 md:gap-4 items-center justify-center">
              {/* Vertical Dropdown */}
              <Select value={vertical || "all"} onValueChange={handleVerticalChange}>
                <SelectTrigger className="flex-1 md:flex-none md:w-48 bg-transparent border-border text-sm">
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
              <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-none gap-1 md:gap-2 px-2 md:px-3 h-9"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Cards</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none gap-1 md:gap-2 px-2 md:px-3 h-9"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid/List */}
      <section className="px-4 md:px-6 pb-8 md:pb-12">
        <div className="container mx-auto">
          {articlesLoading ? (
            viewMode === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-0">
                      <Skeleton className="h-36 md:h-48 w-full" />
                      <div className="p-4 md:p-6 space-y-2 md:space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 md:h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-0 flex flex-row">
                      <Skeleton className="h-24 w-24 md:h-32 md:w-48 shrink-0" />
                      <div className="p-3 md:p-4 space-y-2 flex-1">
                        <Skeleton className="h-3 md:h-4 w-20" />
                        <Skeleton className="h-4 md:h-5 w-full" />
                        <Skeleton className="h-3 md:h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : articles?.length === 0 ? (
            <div className="text-center py-12 md:py-20">
              <p className="text-muted-foreground text-base md:text-lg">No articles found.</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {articles?.map((article) => (
                <Link 
                  key={article.id} 
                  to={generateArticleUrl(article)}
                >
                  <Card className="bg-transparent border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group h-full">
                    <CardContent className="p-0">
                      <div className="h-36 md:h-48 overflow-hidden">
                        <img
                          src={article.image_url || DEFAULT_ARTICLE_IMAGE}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <Badge variant="outline" className="text-xs">
                            {formatVerticalName(article.vertical_slug)}
                          </Badge>
                          {article.read_time && (
                            <span className="text-xs text-muted-foreground">
                              {article.read_time}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-base md:text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {decodeHtmlEntities(article.title)}
                        </h3>
                        {article.excerpt && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 mb-2 md:mb-3">
                            {decodeHtmlEntities(article.excerpt)}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(article.published_at)}
                          </span>
                          <span className="text-primary text-xs md:text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {articles?.map((article) => (
                <Link 
                  key={article.id} 
                  to={generateArticleUrl(article)}
                >
                  <Card className="bg-transparent border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-0 flex flex-row">
                      <div className="h-24 w-24 md:h-auto md:w-56 shrink-0 overflow-hidden">
                        <img
                          src={article.image_url || DEFAULT_ARTICLE_IMAGE}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 md:p-5 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {formatVerticalName(article.vertical_slug)}
                            </Badge>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {formatDate(article.published_at)}
                            </span>
                          </div>
                          <h3 className="font-medium text-sm md:text-lg text-foreground mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {decodeHtmlEntities(article.title)}
                          </h3>
                          {article.excerpt && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                              {decodeHtmlEntities(article.excerpt)}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 md:mt-3">
                          <span className="text-primary text-xs md:text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="px-4 md:px-6 pb-16 md:pb-20">
          <div className="container mx-auto">
            <div className="flex items-center justify-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1 px-2 md:px-3 h-8 md:h-9"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === "number" ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 md:w-10 md:h-9 text-xs md:text-sm p-0"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-1 md:px-2 text-muted-foreground text-sm">
                      {page}
                    </span>
                  )
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-1 px-2 md:px-3 h-8 md:h-9"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-center text-xs md:text-sm text-muted-foreground mt-3 md:mt-4">
              Page {currentPage} of {totalPages} ({totalCount?.toLocaleString()} articles)
            </p>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default IntelVertical;
