import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

const IntelVertical = () => {
  const { slugOrVertical } = useParams<{ slugOrVertical: string }>();
  
  // Determine if this is a vertical or article page
  // Articles have a post_id suffix like "-1234567" at the end
  const postIdMatch = slugOrVertical?.match(/-(\d{4,})$/);
  const isArticle = !!postIdMatch || !KNOWN_VERTICALS.includes(slugOrVertical || "");
  
  const vertical = isArticle ? null : slugOrVertical;
  const articleSlug = isArticle ? slugOrVertical : null;
  const postId = postIdMatch?.[1];

  // Fetch articles for vertical page
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["intel-vertical-articles", vertical],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("vertical_slug", vertical)
        .order("published_at", { ascending: false })
        .limit(50);
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
        // Fallback: search by title similarity
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

  // VERTICAL PAGE RENDER
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto max-w-6xl">
          <Link 
            to="/intel" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Intelligence
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            {formatVerticalName(vertical || "")} Intelligence
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stay updated with the latest {formatVerticalName(vertical || "")} news, insights, and intelligence.
          </p>
        </div>
      </section>

      {/* Articles List */}
      <section className="px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          {articlesLoading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <Skeleton className="h-48 md:w-64 shrink-0" />
                    <div className="p-6 space-y-3 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No articles found for this vertical.</p>
              <Link to="/intel" className="text-primary hover:underline mt-2 inline-block">
                Browse all intelligence
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {articles?.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/intel/${generateArticleSlug(article)}`}
                >
                  <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                      {article.image_url && (
                        <div className="h-48 md:h-auto md:w-64 shrink-0 overflow-hidden">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
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
                          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="mt-4">
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

      <Footer />
    </div>
  );
};

export default IntelVertical;
