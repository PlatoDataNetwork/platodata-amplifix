import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Search, Tags, Sparkles, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

const SeoAutoTagger = () => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all"); // "all" | "untagged" | "tagged"
  const [page, setPage] = useState(0);

  // Fetch verticals
  const { data: verticals } = useQuery({
    queryKey: ["seo-tagger-verticals"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_article_verticals");
      return data || [];
    },
  });

  // Fetch articles with tag counts
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["seo-tagger-articles", searchQuery, verticalFilter, tagFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("id, title, vertical_slug, published_at, article_tags(tag_id)", { count: "exact" })
        .order("published_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (verticalFilter !== "all") {
        query = query.eq("vertical_slug", verticalFilter);
      }
      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      let filtered = data || [];
      if (tagFilter === "untagged") {
        filtered = filtered.filter((a: any) => !a.article_tags || a.article_tags.length === 0);
      } else if (tagFilter === "tagged") {
        filtered = filtered.filter((a: any) => a.article_tags && a.article_tags.length > 0);
      }

      return { articles: filtered, totalCount: count || 0 };
    },
  });

  const articles = articlesData?.articles || [];
  const totalCount = articlesData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Auto-tag mutation
  const autoTagMutation = useMutation({
    mutationFn: async (articleIds: string[]) => {
      // Process in batches of 5 to avoid timeouts
      const batchSize = 5;
      const allResults: any[] = [];
      
      for (let i = 0; i < articleIds.length; i += batchSize) {
        const batch = articleIds.slice(i, i + batchSize);
        const { data, error } = await supabase.functions.invoke("extract-seo-tags", {
          body: { article_ids: batch },
        });
        if (error) throw error;
        if (data?.results) allResults.push(...data.results);
      }
      return allResults;
    },
    onSuccess: (results) => {
      const successful = results.filter((r: any) => r.tags_added?.length > 0);
      const failed = results.filter((r: any) => r.error);
      const totalTags = successful.reduce((sum: number, r: any) => sum + r.tags_added.length, 0);

      toast.success(
        `Tagged ${successful.length} articles with ${totalTags} keywords${failed.length > 0 ? ` (${failed.length} failed)` : ""}`
      );
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["seo-tagger-articles"] });
    },
    onError: (error: Error) => {
      toast.error(`Auto-tagging failed: ${error.message}`);
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map((a: any) => a.id)));
    }
  };

  const handleAutoTag = () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one article");
      return;
    }
    autoTagMutation.mutate(Array.from(selectedIds));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          SEO Auto-Tagger
        </h2>
        <p className="text-muted-foreground mt-1">
          AI-powered keyword extraction — select articles and bulk auto-tag with high-value SEO keywords.
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <label className="text-sm text-muted-foreground mb-1 block">Vertical</label>
              <Select value={verticalFilter} onValueChange={(v) => { setVerticalFilter(v); setPage(0); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verticals</SelectItem>
                  {verticals?.map((v: any) => (
                    <SelectItem key={v.vertical_slug} value={v.vertical_slug}>
                      {v.vertical_slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[160px]">
              <label className="text-sm text-muted-foreground mb-1 block">Tag Status</label>
              <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v); setPage(0); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="untagged">Untagged Only</SelectItem>
                  <SelectItem value="tagged">Tagged Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAutoTag}
              disabled={selectedIds.size === 0 || autoTagMutation.isPending}
              className="gap-2"
            >
              {autoTagMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Auto-Tag {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Articles {totalCount > 0 && <span className="text-muted-foreground font-normal">({totalCount})</span>}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={articles.length > 0 && selectedIds.size === articles.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : articles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No articles found.</p>
          ) : (
            <div className="space-y-2">
              {articles.map((article: any) => {
                const tagCount = article.article_tags?.length || 0;
                const isSelected = selectedIds.has(article.id);

                return (
                  <div
                    key={article.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                      isSelected ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
                    }`}
                    onClick={() => toggleSelect(article.id)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(article.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{article.vertical_slug}</Badge>
                        {tagCount > 0 ? (
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {tagCount} tags
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> No tags
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results display when mutation completes */}
      {autoTagMutation.data && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tags className="w-5 h-5 text-primary" />
              Last Run Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {autoTagMutation.data.map((result: any, i: number) => (
                <div key={i} className="text-sm flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                  {result.error ? (
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-foreground">{result.article_id.slice(0, 8)}...</p>
                    {result.error ? (
                      <p className="text-destructive text-xs">{result.error}</p>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.tags_added.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoAutoTagger;
