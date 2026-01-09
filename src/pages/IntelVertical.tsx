import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Search, LayoutGrid, List, ArrowLeft } from "lucide-react";
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

// Known verticals list for routing detection
const KNOWN_VERTICALS = [
  "aerospace", "ar-vr", "artificial-intelligence", "autism", "automotive",
  "aviation", "big-data", "biotech", "biotechnology", "blockchain",
  "cannabis", "carbon", "cleantech", "clinical-trials", "code",
  "crowdfunding", "cyber-security", "defense", "ecommerce", "edtech",
  "esports", "fintech", "foodtech", "gaming", "government", "healthcare",
  "hr-tech", "iot", "legal-tech", "lifesciences", "logistics", "manufacturing",
  "media", "mobility", "nanotech", "pharma", "real-estate", "retail",
  "robotics", "saas", "space", "sports", "supply-chain", "telecom",
  "travel", "venture-capital", "web3"
];

const ARTICLES_PER_PAGE = 24;

const IntelVertical = () => {
  const { slugOrVertical } = useParams<{ slugOrVertical: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Determine if this is a vertical or article page
  const postIdMatch = slugOrVertical?.match(/-(\d{4,})$/);
  const isArticle = !!postIdMatch || !KNOWN_VERTICALS.includes(slugOrVertical || "");
  
  const vertical = isArticle ? null : slugOrVertical;
  const articleSlug = isArticle ? slugOrVertical : null;
  const postId = postIdMatch?.[1];

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

  // Fetch total count for pagination (vertical page)
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

  // Fetch single article
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["intel-article", articleSlug],
    queryFn: async () => {
      let query = supabase.from("articles").select("*");
      
      if (postId) {
        query = query.eq("post_id", parseInt(postId));
      } else {
        const titlePart = articleSlug?.replace(/-/g, " ").slice(0, 50);
        query = query.ilike("title", `%${titlePart}%`);
      }
      
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isArticle,
  });

  // Fetch related articles for article page
  const { data: relatedArticles } = useQuery({
    queryKey: ["intel-related", article?.vertical_slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("vertical_slug", article?.vertical_slug)
        .neq("id", article?.id)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!article?.vertical_slug,
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
      navigate("/intel");
    } else {
      navigate(`/intel/${value}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLongDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
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

  const generateArticleSlug = (article: { title: string; post_id: number | null }) => {
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
    return article.post_id ? `${slug}-${article.post_id}` : slug;
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

  // ARTICLE PAGE RENDER
  if (isArticle) {
    if (articleLoading) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <section className="pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-4xl">
              <Skeleton className="h-4 w-48 mb-6" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-6 w-64 mb-8" />
              <Skeleton className="h-96 w-full mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </section>
          <Footer />
        </div>
      );
    }

    if (!article) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <section className="pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
              <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
              <Link to="/intel" className="text-primary hover:underline">
                Browse all intelligence
              </Link>
            </div>
          </section>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Article Header */}
        <section className="pt-32 pb-8 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Link 
                to="/intel" 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Intelligence
              </Link>
              <Link 
                to={`/intel/${article.vertical_slug}`}
                className="text-primary hover:underline text-sm"
              >
                {formatVerticalName(article.vertical_slug)}
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              {article.author && (
                <span>Republished By {article.author}</span>
              )}
              <span>{formatLongDate(article.published_at)}</span>
              {article.post_id && (
                <span>ID: {article.post_id}</span>
              )}
              {article.read_time && (
                <span>{article.read_time}</span>
              )}
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {article.image_url && (
          <section className="px-6 pb-8">
            <div className="container mx-auto max-w-4xl">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full rounded-lg object-cover max-h-[500px]"
              />
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="px-6 pb-12">
          <div className="container mx-auto max-w-4xl">
            {article.content ? (
              <div 
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-foreground 
                  prose-p:text-muted-foreground 
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : article.excerpt ? (
              <p className="text-lg text-muted-foreground">{article.excerpt}</p>
            ) : null}
          </div>
        </section>

        {/* Source & Tags */}
        <section className="px-6 pb-12">
          <div className="container mx-auto max-w-4xl">
            <div className="border-t border-border pt-8">
              {article.external_url && (
                <p className="text-sm text-muted-foreground mb-4">
                  Source:{" "}
                  <a 
                    href={article.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {new URL(article.external_url).hostname}
                  </a>
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                Platodata is Powered by{" "}
                <a href="https://platodata.io" className="text-primary hover:underline">
                  Plato Data Intelligence.
                </a>
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">#{formatVerticalName(article.vertical_slug)}</Badge>
                {article.category && (
                  <Badge variant="outline">#{article.category}</Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="px-6 pb-20">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link 
                    key={related.id} 
                    to={`/intel/${generateArticleSlug(related)}`}
                    className="group"
                  >
                    {related.image_url && (
                      <div className="h-32 rounded-lg overflow-hidden mb-3">
                        <img
                          src={related.image_url}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                      {related.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    );
  }

  // VERTICAL PAGE RENDER (same layout as Intel page)
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            {formatVerticalName(vertical || "")} Intelligence
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest {formatVerticalName(vertical || "")} news, insights, and intelligence.
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
                placeholder="Search articles..."
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
            <Select value={vertical || "all"} onValueChange={handleVerticalChange}>
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

      {/* Articles Grid/List */}
      <section className="px-6 pb-12">
        <div className="container mx-auto">
          {articlesLoading ? (
            viewMode === "cards" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-0">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                      <Skeleton className="h-32 md:w-48 shrink-0" />
                      <div className="p-4 space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : articles?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No articles found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles?.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/intel/${generateArticleSlug(article)}`}
                >
                  <Card className="bg-transparent border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group h-full">
                    <CardContent className="p-0">
                      {article.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {formatVerticalName(article.vertical_slug)}
                          </Badge>
                          {article.read_time && (
                            <span className="text-xs text-muted-foreground">
                              {article.read_time}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(article.published_at)}
                          </span>
                          <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {articles?.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/intel/${generateArticleSlug(article)}`}
                >
                  <Card className="bg-transparent border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                      {article.image_url && (
                        <div className="h-40 md:h-auto md:w-56 shrink-0 overflow-hidden">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {formatVerticalName(article.vertical_slug)}
                            </Badge>
                            {article.read_time && (
                              <span className="text-xs text-muted-foreground">
                                {article.read_time}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(article.published_at)}
                            </span>
                          </div>
                          <h3 className="font-medium text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="mt-3">
                          <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read Full Article <ArrowRight className="w-4 h-4" />
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
        <section className="px-6 pb-20">
          <div className="container mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === "number" ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">
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
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
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
