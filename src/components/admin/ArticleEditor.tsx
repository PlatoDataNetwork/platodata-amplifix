import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, X, Plus, Sparkles, Loader2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"articles">;
type Tag = Tables<"tags">;

interface ArticleEditorProps {
  article?: Article | null;
  onBack: () => void;
  onSave?: () => void;
}

const ArticleEditor = ({ article, onBack, onSave }: ArticleEditorProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!article;

  const [form, setForm] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    author: article?.author || "",
    vertical_slug: article?.vertical_slug || "",
    image_url: article?.image_url || "",
    read_time: article?.read_time || "",
  });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSelectOpen, setTagSelectOpen] = useState(false);

  // Fetch verticals for dropdown
  const { data: verticals } = useQuery({
    queryKey: ["admin-verticals"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_article_verticals");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all tags
  const { data: allTags } = useQuery({
    queryKey: ["admin-tags-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing article tags when editing
  const { data: existingArticleTags } = useQuery({
    queryKey: ["article-tags", article?.id],
    queryFn: async () => {
      if (!article?.id) return [];
      const { data, error } = await supabase
        .from("article_tags")
        .select("tag_id")
        .eq("article_id", article.id);
      if (error) throw error;
      return data.map((t) => t.tag_id);
    },
    enabled: !!article?.id,
  });

  // Set initial tags when editing
  useEffect(() => {
    if (existingArticleTags) {
      setSelectedTagIds(existingArticleTags);
    }
  }, [existingArticleTags]);

  // Helper to get next sequential post_id
  const getNextPostId = async (): Promise<number> => {
    const { data, error } = await supabase
      .from("articles")
      .select("post_id")
      .not("post_id", "is", null)
      .order("post_id", { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error fetching max post_id:", error);
      return 1;
    }
    
    if (data && data.length > 0 && data[0].post_id) {
      return data[0].post_id + 1;
    }
    
    return 1;
  };

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Article, "id" | "created_at" | "updated_at" | "post_id" | "metadata">) => {
      // Get the next sequential post_id
      const nextPostId = await getNextPostId();
      
      const { data: newArticle, error } = await supabase
        .from("articles")
        .insert({ ...data, post_id: nextPostId })
        .select("id")
        .single();
      if (error) throw error;
      return newArticle;
    },
    onSuccess: async (newArticle) => {
      // Save article tags
      if (selectedTagIds.length > 0 && newArticle?.id) {
        const tagInserts = selectedTagIds.map((tag_id) => ({
          article_id: newArticle.id,
          tag_id,
        }));
        const { error } = await supabase.from("article_tags").insert(tagInserts);
        if (error) {
          console.error("Failed to save tags:", error);
          toast.error("Article created but failed to save tags");
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article-count"] });
      toast.success("Article created successfully");
      onSave?.();
      onBack();
    },
    onError: (error) => {
      toast.error(`Failed to create article: ${error.message}`);
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Article> & { id: string; currentPostId?: number | null }) => {
      const { id, currentPostId, ...updates } = data;
      
      // If article doesn't have a post_id, assign one
      if (!currentPostId) {
        const nextPostId = await getNextPostId();
        (updates as Partial<Article>).post_id = nextPostId;
      }
      
      const { error } = await supabase.from("articles").update(updates).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (articleId) => {
      // Update article tags - delete existing and insert new
      if (articleId) {
        // Delete existing tags
        const { error: deleteError } = await supabase
          .from("article_tags")
          .delete()
          .eq("article_id", articleId);
        
        if (deleteError) {
          console.error("Failed to delete existing tags:", deleteError);
        }

        // Insert new tags
        if (selectedTagIds.length > 0) {
          const tagInserts = selectedTagIds.map((tag_id) => ({
            article_id: articleId,
            tag_id,
          }));
          const { error: insertError } = await supabase.from("article_tags").insert(tagInserts);
          if (insertError) {
            console.error("Failed to save tags:", insertError);
            toast.error("Article updated but failed to save tags");
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["article-tags", articleId] });
      toast.success("Article updated successfully");
      onSave?.();
      onBack();
    },
    onError: (error) => {
      toast.error(`Failed to update article: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!form.vertical_slug) {
      toast.error("Vertical is required");
      return;
    }

    const articleData = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content || null,
      author: form.author.trim() || null,
      category: null,
      vertical_slug: form.vertical_slug,
      image_url: form.image_url.trim() || null,
      external_url: null,
      read_time: form.read_time.trim() || null,
      published_at: article?.published_at || new Date().toISOString(),
    };

    if (isEditing && article) {
      updateMutation.mutate({ id: article.id, currentPostId: article.post_id, ...articleData });
    } else {
      createMutation.mutate(articleData);
    }
  };

  const handleAddTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
    setTagSelectOpen(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  const getTagById = (tagId: string): Tag | undefined => {
    return allTags?.find((t) => t.id === tagId);
  };

  const availableTags = allTags?.filter((t) => !selectedTagIds.includes(t.id)) || [];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isEditing ? "Edit Article" : "Create New Article"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isEditing ? "Update article details and content" : "Fill in the details to publish a new article"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            <Save className="w-4 h-4 mr-2" />
            {isPending ? "Saving..." : isEditing ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Enter article title..."
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Brief summary of the article..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={form.content}
                onChange={(content) => setForm((f) => ({ ...f, content }))}
                placeholder="Write your article content here..."
              />
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Article Details</h3>

              {/* Post ID - shown when editing an existing article */}
              {isEditing && article?.post_id && (
                <div className="space-y-2">
                  <Label>Post ID</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={article.post_id.toString()}
                      readOnly
                      disabled
                      className="bg-muted text-muted-foreground font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-assigned unique identifier</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="vertical">Vertical *</Label>
                <Select
                  value={form.vertical_slug}
                  onValueChange={(value) => setForm((f) => ({ ...f, vertical_slug: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vertical..." />
                  </SelectTrigger>
                  <SelectContent>
                    {verticals?.map((v) => (
                      <SelectItem key={v.vertical_slug} value={v.vertical_slug}>
                        {v.vertical_slug
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="Author name..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time</Label>
                <Input
                  id="read_time"
                  value={form.read_time}
                  onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))}
                  placeholder="e.g., 5 min read"
                />
              </div>
            </div>

            {/* Tags Section */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Tags</h3>
              
              {/* Selected Tags */}
              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTagIds.map((tagId) => {
                    const tag = getTagById(tagId);
                    if (!tag) return null;
                    return (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tagId)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Add Tag Dropdown */}
              {availableTags.length > 0 ? (
                <Select
                  open={tagSelectOpen}
                  onOpenChange={setTagSelectOpen}
                  onValueChange={handleAddTag}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Plus className="w-4 h-4" />
                      <span>Add tag...</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : allTags?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tags available. Create tags in Tags Management first.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All tags have been added.
                </p>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Media</h3>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <ImageUpload
                  value={form.image_url}
                  onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;
