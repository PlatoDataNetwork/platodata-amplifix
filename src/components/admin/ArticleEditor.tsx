import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"articles">;

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
    category: article?.category || "",
    vertical_slug: article?.vertical_slug || "",
    image_url: article?.image_url || "",
    external_url: article?.external_url || "",
    read_time: article?.read_time || "",
  });

  // Fetch verticals for dropdown
  const { data: verticals } = useQuery({
    queryKey: ["admin-verticals"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_article_verticals");
      if (error) throw error;
      return data;
    },
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Article, "id" | "created_at" | "updated_at" | "post_id" | "metadata">) => {
      const { error } = await supabase.from("articles").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
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
    mutationFn: async (data: Partial<Article> & { id: string }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from("articles").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
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
      category: form.category.trim() || null,
      vertical_slug: form.vertical_slug,
      image_url: form.image_url.trim() || null,
      external_url: form.external_url.trim() || null,
      read_time: form.read_time.trim() || null,
      published_at: article?.published_at || new Date().toISOString(),
    };

    if (isEditing && article) {
      updateMutation.mutate({ id: article.id, ...articleData });
    } else {
      createMutation.mutate(articleData);
    }
  };

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
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g., News, Tutorial..."
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

            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Media & Links</h3>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <ImageUpload
                  value={form.image_url}
                  onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_url">External Source URL</Label>
                <Input
                  id="external_url"
                  value={form.external_url}
                  onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))}
                  placeholder="https://..."
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
