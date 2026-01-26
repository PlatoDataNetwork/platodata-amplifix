import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Image, Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DEFAULT_IMAGE_PATTERN = "article-default-img";

const OGImageGenerator = () => {
  const queryClient = useQueryClient();
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Fetch articles without custom images
  const { data: articlesWithoutImages, isLoading } = useQuery({
    queryKey: ["articles-without-og-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, post_id, title, vertical_slug, image_url")
        .or(`image_url.is.null,image_url.ilike.%${DEFAULT_IMAGE_PATTERN}%`)
        .order("published_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Count total articles without images
  const { data: totalCount } = useQuery({
    queryKey: ["articles-without-og-images-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .or(`image_url.is.null,image_url.ilike.%${DEFAULT_IMAGE_PATTERN}%`);

      if (error) throw error;
      return count || 0;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { data, error } = await supabase.functions.invoke("generate-og-image", {
        body: { articleId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data, articleId) => {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["articles-without-og-images"] });
      queryClient.invalidateQueries({ queryKey: ["articles-without-og-images-count"] });
      toast.success("OG image generated successfully!");
    },
    onError: (error: Error, articleId) => {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
      toast.error(`Failed to generate image: ${error.message}`);
    },
  });

  const handleGenerateSingle = (articleId: string) => {
    setGeneratingIds((prev) => new Set(prev).add(articleId));
    generateMutation.mutate(articleId);
  };

  const handleGenerateBatch = async () => {
    if (!articlesWithoutImages?.length) return;

    const toGenerate = articlesWithoutImages.slice(0, 10); // Generate 10 at a time
    setBatchProgress({ current: 0, total: toGenerate.length });

    for (let i = 0; i < toGenerate.length; i++) {
      const article = toGenerate[i];
      setGeneratingIds((prev) => new Set(prev).add(article.id));
      
      try {
        await generateMutation.mutateAsync(article.id);
      } catch {
        // Error already handled in mutation
      }
      
      setBatchProgress({ current: i + 1, total: toGenerate.length });
      
      // Small delay between requests to avoid rate limiting
      if (i < toGenerate.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setBatchProgress(null);
    toast.success(`Batch generation complete!`);
  };

  const truncateTitle = (title: string, maxLength = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI OG Image Generator
              </CardTitle>
              <CardDescription>
                Generate custom Open Graph images with article titles for better social media previews
              </CardDescription>
            </div>
            {totalCount !== undefined && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalCount} articles without custom images
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              onClick={handleGenerateBatch}
              disabled={batchProgress !== null || !articlesWithoutImages?.length}
            >
              {batchProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating {batchProgress.current}/{batchProgress.total}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Batch (10 articles)
                </>
              )}
            </Button>
          </div>

          {batchProgress && (
            <div className="mb-6">
              <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Processing {batchProgress.current} of {batchProgress.total} articles...
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : articlesWithoutImages?.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">All caught up!</h3>
              <p className="text-muted-foreground">All articles have custom OG images.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articlesWithoutImages?.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {article.image_url ? (
                        <div className="w-16 h-10 rounded overflow-hidden bg-muted">
                          <img
                            src={article.image_url}
                            alt=""
                            className="w-full h-full object-cover opacity-50"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-10 rounded bg-muted flex items-center justify-center">
                          <Image className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={article.title}>
                        {truncateTitle(article.title)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {article.vertical_slug}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ID: {article.post_id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateSingle(article.id)}
                    disabled={generatingIds.has(article.id)}
                  >
                    {generatingIds.has(article.id) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {articlesWithoutImages && articlesWithoutImages.length > 0 && totalCount && totalCount > 50 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Showing first 50 articles</p>
                <p className="text-xs text-muted-foreground">
                  There are {totalCount - 50} more articles without custom images. 
                  Generate images in batches to process all of them.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OGImageGenerator;
