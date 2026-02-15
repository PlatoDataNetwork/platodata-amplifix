import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  Code,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SITE_URL = "https://www.platodata.io";

interface OGMetaData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
}

const SocialPreviewDebugger = () => {
  const [postId, setPostId] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [previewData, setPreviewData] = useState<OGMetaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rawHtml, setRawHtml] = useState<string>("");

  // Fetch recent articles for quick selection
  const { data: recentArticles } = useQuery({
    queryKey: ["recent-articles-for-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, post_id, title, vertical_slug, image_url")
        .order("published_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const fetchPreview = async (articlePostId: string) => {
    if (!articlePostId) {
      toast.error("Please enter a post ID or select an article");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch from og-meta edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-meta?postId=${articlePostId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      setRawHtml(html);

      // Parse the HTML to extract meta tags
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const getMeta = (property: string): string => {
        const meta = doc.querySelector(`meta[property="${property}"]`) || 
                     doc.querySelector(`meta[name="${property}"]`);
        return meta?.getAttribute("content") || "";
      };

      const data: OGMetaData = {
        title: getMeta("og:title") || doc.querySelector("title")?.textContent || "",
        description: getMeta("og:description") || getMeta("description") || "",
        image: getMeta("og:image") || "",
        url: getMeta("og:url") || "",
        type: getMeta("og:type") || "website",
        siteName: getMeta("og:site_name") || "Platodata",
      };

      setPreviewData(data);
      toast.success("Preview loaded successfully");
    } catch (error) {
      console.error("Error fetching preview:", error);
      toast.error(`Failed to fetch preview: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleSelect = (value: string) => {
    setSelectedArticleId(value);
    const article = recentArticles?.find(a => a.id === value);
    if (article?.post_id) {
      setPostId(article.post_id.toString());
    }
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getValidationStatus = () => {
    if (!previewData) return null;

    const issues: { type: "error" | "warning"; message: string }[] = [];

    if (!previewData.title) {
      issues.push({ type: "error", message: "Missing og:title" });
    } else if (previewData.title.length > 70) {
      issues.push({ type: "warning", message: "Title may be truncated (>70 chars)" });
    }

    if (!previewData.description) {
      issues.push({ type: "error", message: "Missing og:description" });
    } else if (previewData.description.length > 200) {
      issues.push({ type: "warning", message: "Description may be truncated (>200 chars)" });
    }

    if (!previewData.image) {
      issues.push({ type: "error", message: "Missing og:image" });
    } else if (previewData.image.includes("article-default-img")) {
      issues.push({ type: "warning", message: "Using default image" });
    }

    if (!previewData.url) {
      issues.push({ type: "error", message: "Missing og:url" });
    }

    return issues;
  };

  const validationIssues = getValidationStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Social Preview Debugger
          </CardTitle>
          <CardDescription>
            Test how article links appear when shared on social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Article Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Recent Article</Label>
              <Select value={selectedArticleId} onValueChange={handleArticleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an article..." />
                </SelectTrigger>
                <SelectContent>
                  {recentArticles?.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      <span className="truncate max-w-[300px] block">
                        {truncate(article.title, 50)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Or Enter Post ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 186957"
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                />
                <Button
                  onClick={() => fetchPreview(postId)}
                  disabled={isLoading || !postId}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          {postId && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`${SITE_URL}/share/article/${postId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share URL
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(`${SITE_URL}/share/article/${postId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook Debugger
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://cards-dev.twitter.com/validator`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter Validator
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(`${SITE_URL}/share/article/${postId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn Inspector
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Status */}
      {validationIssues && validationIssues.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Validation Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    issue.type === "error" ? "text-destructive" : "text-primary"
                  }`}
                >
                  {issue.type === "error" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  {issue.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {validationIssues && validationIssues.length === 0 && previewData && (
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">All OG tags are valid!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Cards */}
      {previewData && (
        <Tabs defaultValue="facebook" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="facebook" className="flex items-center gap-1">
              <Facebook className="h-4 w-4" />
              <span className="hidden sm:inline">Facebook</span>
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-1">
              <Twitter className="h-4 w-4" />
              <span className="hidden sm:inline">Twitter</span>
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Raw HTML</span>
            </TabsTrigger>
          </TabsList>

          {/* Facebook Preview */}
          <TabsContent value="facebook" className="mt-4">
            <Card className="max-w-[500px] overflow-hidden">
              <div className="aspect-[1.91/1] bg-muted relative">
                {previewData.image ? (
                  <img
                    src={previewData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <CardContent className="p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {new URL(previewData.url || SITE_URL).hostname}
                </p>
                <h3 className="font-semibold text-foreground line-clamp-2 mt-1">
                  {previewData.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {previewData.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Twitter Preview */}
          <TabsContent value="twitter" className="mt-4">
            <Card className="max-w-[500px] overflow-hidden rounded-xl border">
              <div className="aspect-[2/1] bg-muted relative">
                {previewData.image ? (
                  <img
                    src={previewData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-foreground line-clamp-1">
                  {previewData.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {previewData.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {new URL(previewData.url || SITE_URL).hostname}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LinkedIn Preview */}
          <TabsContent value="linkedin" className="mt-4">
            <Card className="max-w-[500px] overflow-hidden">
              <div className="aspect-[1.91/1] bg-muted relative">
                {previewData.image ? (
                  <img
                    src={previewData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <CardContent className="p-4 bg-card">
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {previewData.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new URL(previewData.url || SITE_URL).hostname}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Preview */}
          <TabsContent value="whatsapp" className="mt-4">
            <div className="max-w-[350px] bg-[#075E54] p-3 rounded-lg">
              <Card className="overflow-hidden rounded-lg">
                <div className="aspect-[1.91/1] bg-muted relative">
                  {previewData.image ? (
                    <img
                      src={previewData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <CardContent className="p-2 bg-card">
                  <h3 className="font-medium text-foreground text-sm line-clamp-2">
                    {previewData.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {previewData.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new URL(previewData.url || SITE_URL).hostname}
                  </p>
                </CardContent>
              </Card>
              <p className="text-[#25D366] text-sm mt-2 break-all">
                {previewData.url}
              </p>
            </div>
          </TabsContent>

          {/* Raw HTML */}
          <TabsContent value="raw" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Raw HTML Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
                    {rawHtml || "No data loaded"}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Meta Tags Summary */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta Tags Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                { label: "og:title", value: previewData.title, max: 70 },
                { label: "og:description", value: previewData.description, max: 200 },
                { label: "og:image", value: previewData.image, max: null },
                { label: "og:url", value: previewData.url, max: null },
                { label: "og:type", value: previewData.type, max: null },
                { label: "og:site_name", value: previewData.siteName, max: null },
              ].map((tag) => (
                <div key={tag.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {tag.label}
                    </Badge>
                    {tag.max && tag.value && (
                      <span className={`text-xs ${tag.value.length > tag.max ? "text-destructive" : "text-muted-foreground"}`}>
                        {tag.value.length}/{tag.max} chars
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground break-all pl-2 border-l-2 border-border">
                    {tag.value || <span className="italic text-destructive">Missing</span>}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full max-w-[500px]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      )}
    </div>
  );
};

export default SocialPreviewDebugger;
