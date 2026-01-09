import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_ARTICLE_IMAGE = "/images/article-default-img.jpg";

const ArticlePage = () => {
  const { postId, vertical, slug } = useParams<{ postId: string; vertical: string; slug: string }>();

  // Fetch single article by post_id
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["article", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("post_id", parseInt(postId || "0"))
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  // Fetch related articles for article page
  const { data: relatedArticles } = useQuery({
    queryKey: ["related-articles", article?.vertical_slug],
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

  const generateArticleUrl = (article: { title: string; post_id: number | null; vertical_slug: string }) => {
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
    return `/w3ai/${article.post_id}/${article.vertical_slug}/${titleSlug}`;
  };

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
            {decodeHtmlEntities(article.title)}
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
      <section className="px-6 pb-8">
        <div className="container mx-auto max-w-4xl">
          <img
            src={article.image_url || DEFAULT_ARTICLE_IMAGE}
            alt={article.title}
            className="w-full rounded-lg object-cover max-h-[500px]"
          />
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          {article.content ? (
            <div 
              className="article-content"
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
                  to={generateArticleUrl(related)}
                  className="group"
                >
                  <div className="h-32 rounded-lg overflow-hidden mb-3">
                    <img
                      src={related.image_url || DEFAULT_ARTICLE_IMAGE}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                    {decodeHtmlEntities(related.title)}
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
};

export default ArticlePage;
