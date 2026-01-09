import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Intel = () => {
  // Fetch featured/latest articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ["intel-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  // Fetch unique verticals
  const { data: verticals } = useQuery({
    queryKey: ["intel-verticals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("vertical_slug")
        .limit(1000);
      if (error) throw error;
      const uniqueVerticals = [...new Set(data.map((a) => a.vertical_slug))];
      return uniqueVerticals.slice(0, 20);
    },
  });

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

  const generateArticleSlug = (article: { title: string; post_id: number | null }) => {
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
    return article.post_id ? `${slug}-${article.post_id}` : slug;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Platodata Intelligence
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Insights on AI, data intelligence, Web3, and emerging technologies.
          </p>
        </div>
      </section>

      {/* Verticals Filter */}
      <section className="px-6 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2">
            <Link to="/intel">
              <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                All
              </Badge>
            </Link>
            {verticals?.map((vertical) => (
              <Link key={vertical} to={`/intel/${vertical}`}>
                <Badge variant="outline" className="hover:bg-secondary cursor-pointer">
                  {formatVerticalName(vertical)}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles?.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/intel/${generateArticleSlug(article)}`}
                >
                  <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group h-full">
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
                          <Link 
                            to={`/intel/${article.vertical_slug}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Badge variant="outline" className="text-xs hover:bg-secondary">
                              {formatVerticalName(article.vertical_slug)}
                            </Badge>
                          </Link>
                          {article.read_time && (
                            <span className="text-xs text-muted-foreground">
                              {article.read_time}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Intel;
