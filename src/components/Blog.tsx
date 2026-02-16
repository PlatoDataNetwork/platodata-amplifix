import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useLangRouting } from "@/hooks/useLangRouting";
import { decodeHtmlEntities } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_ARTICLE_IMAGE = "/images/article-default-img.jpg";

const Blog = () => {
  const { withLang } = useLangRouting();

  // Fetch latest 3 articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ["latest-articles-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const generateArticleUrl = (article: { title: string; post_id: number | null; vertical_slug: string }) => {
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return withLang(`/w3ai/${article.post_id}/${article.vertical_slug}/${titleSlug}`);
  };

  return (
    <section className="py-16 md:py-32 relative" id="resources">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-3 md:space-y-4">
            <p className="text-primary text-xs md:text-sm font-medium tracking-wide uppercase">Blog</p>
            <h2 className="text-3xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight px-2">Latest news on Plato</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-5 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border"
                >
                  <Skeleton className="aspect-video rounded-lg md:rounded-xl mb-4 md:mb-6" />
                  <Skeleton className="h-4 w-24 mb-2 md:mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-3 md:mb-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            ) : articles?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No articles available yet.</p>
              </div>
            ) : (
              articles?.map((article, index) => (
                <Link
                  key={article.id}
                  to={generateArticleUrl(article)}
                  className="group p-5 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-in block"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-video rounded-lg md:rounded-xl mb-4 md:mb-6 overflow-hidden">
                    <img
                      src={article.image_url || DEFAULT_ARTICLE_IMAGE}
                      alt={decodeHtmlEntities(article.title)}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                    {formatDate(article.published_at)}
                  </div>
                  <h3 className="text-base md:text-xl font-semibold mb-3 md:mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {decodeHtmlEntities(article.title)}
                  </h3>
                  
                  <div className="flex items-center text-primary text-xs md:text-sm font-medium">
                    Read more
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center pt-8 md:pt-12">
            <Link
              to={withLang("/intel")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View all articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
