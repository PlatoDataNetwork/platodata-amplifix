import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Edit2, 
  Play, 
  Pause, 
  AlertCircle,
  Rss,
  Loader2,
  ExternalLink,
  ImageIcon,
  Upload,
  ArrowLeft,
  Settings
} from "lucide-react";
import { format } from "date-fns";

type FeedStatus = "active" | "paused" | "error";
type ImportMode = "full_content" | "excerpt_with_link";
type PublishStatus = "publish" | "draft";

interface RssFeed {
  id: string;
  name: string;
  feed_url: string;
  vertical_slug: string;
  status: FeedStatus;
  import_mode: ImportMode;
  publish_status: PublishStatus;
  auto_sync: boolean;
  sync_interval_hours: number;
  last_synced_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  default_image_url: string | null;
  check_duplicate_title: boolean;
  check_duplicate_link: boolean;
}

interface FeedFormData {
  name: string;
  feed_url: string;
  vertical_slug: string;
  import_mode: ImportMode;
  publish_status: PublishStatus;
  auto_sync: boolean;
  sync_interval_hours: number;
  default_image_url: string;
  check_duplicate_title: boolean;
  check_duplicate_link: boolean;
}

const defaultFormData: FeedFormData = {
  name: "",
  feed_url: "",
  vertical_slug: "",
  import_mode: "full_content",
  publish_status: "draft",
  auto_sync: false,
  sync_interval_hours: 24,
  default_image_url: "",
  check_duplicate_title: false,
  check_duplicate_link: false,
};

interface FeedsSyndicatorProps {
  mode?: "list" | "add" | "edit";
  editFeedId?: string;
  onAddFeed?: () => void;
  onEditFeed?: (feedId: string) => void;
  onBack?: () => void;
}

const FeedsSyndicator = ({ 
  mode = "list", 
  editFeedId, 
  onAddFeed, 
  onEditFeed,
  onBack 
}: FeedsSyndicatorProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FeedFormData>(defaultFormData);
  const [syncingFeedId, setSyncingFeedId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch all feeds
  const { data: feeds, isLoading: feedsLoading } = useQuery({
    queryKey: ["rss-feeds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rss_feeds")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RssFeed[];
    },
  });

  // Fetch single feed for editing
  const { data: editingFeed, isLoading: editFeedLoading } = useQuery({
    queryKey: ["rss-feed", editFeedId],
    queryFn: async () => {
      if (!editFeedId) return null;
      const { data, error } = await supabase
        .from("rss_feeds")
        .select("*")
        .eq("id", editFeedId)
        .single();
      if (error) throw error;
      return data as RssFeed;
    },
    enabled: mode === "edit" && !!editFeedId,
  });

  // Populate form when editing
  useEffect(() => {
    if (editingFeed) {
      setFormData({
        name: editingFeed.name,
        feed_url: editingFeed.feed_url,
        vertical_slug: editingFeed.vertical_slug,
        import_mode: editingFeed.import_mode,
        publish_status: editingFeed.publish_status,
        auto_sync: editingFeed.auto_sync,
        sync_interval_hours: editingFeed.sync_interval_hours,
        default_image_url: editingFeed.default_image_url || "",
        check_duplicate_title: editingFeed.check_duplicate_title || false,
        check_duplicate_link: editingFeed.check_duplicate_link || false,
      });
    }
  }, [editingFeed]);

  // Reset form when mode changes to add
  useEffect(() => {
    if (mode === "add") {
      setFormData(defaultFormData);
    }
  }, [mode]);

  // Fetch verticals for dropdown
  const { data: verticals } = useQuery({
    queryKey: ["verticals-list"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_article_verticals");
      if (error) throw error;
      return data?.map((v: { vertical_slug: string }) => v.vertical_slug) || [];
    },
  });

  // Create feed mutation
  const createFeedMutation = useMutation({
    mutationFn: async (data: FeedFormData) => {
      const { error } = await supabase.from("rss_feeds").insert({
        name: data.name,
        feed_url: data.feed_url,
        vertical_slug: data.vertical_slug,
        import_mode: data.import_mode,
        publish_status: data.publish_status,
        auto_sync: data.auto_sync,
        sync_interval_hours: data.sync_interval_hours,
        status: "active",
        default_image_url: data.default_image_url || null,
        check_duplicate_title: data.check_duplicate_title,
        check_duplicate_link: data.check_duplicate_link,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      toast.success("Feed added successfully");
      onBack?.();
    },
    onError: (error) => {
      toast.error(`Failed to add feed: ${error.message}`);
    },
  });

  // Update feed mutation
  const updateFeedMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FeedFormData> }) => {
      const { error } = await supabase.from("rss_feeds").update({
        ...data,
        default_image_url: data.default_image_url || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      toast.success("Feed updated successfully");
      onBack?.();
    },
    onError: (error) => {
      toast.error(`Failed to update feed: ${error.message}`);
    },
  });

  // Delete feed mutation
  const deleteFeedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rss_feeds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      toast.success("Feed deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete feed: ${error.message}`);
    },
  });

  // Sync feed mutation
  const syncFeedMutation = useMutation({
    mutationFn: async (feedId: string) => {
      setSyncingFeedId(feedId);
      const { data, error } = await supabase.functions.invoke("sync-rss-feed", {
        body: { feedId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      if (data.articlesImported > 0) {
        toast.success(`Imported ${data.articlesImported} new articles`);
      } else {
        toast.info("No new articles to import");
      }
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
    onSettled: () => {
      setSyncingFeedId(null);
    },
  });

  // Toggle feed status
  const toggleFeedStatus = (feed: RssFeed) => {
    const newStatus: FeedStatus = feed.status === "active" ? "paused" : "active";
    updateFeedMutation.mutate({
      id: feed.id,
      data: { status: newStatus } as Partial<FeedFormData>,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "edit" && editFeedId) {
      updateFeedMutation.mutate({ id: editFeedId, data: formData });
    } else {
      createFeedMutation.mutate(formData);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `feed-default-${Date.now()}.${fileExt}`;
      const filePath = `defaults/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, default_image_url: publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to upload image: ${errorMessage}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getStatusBadge = (status: FeedStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  // Render the form for add/edit modes
  if (mode === "add" || mode === "edit") {
    if (mode === "edit" && editFeedLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "edit" ? "Edit RSS Feed" : "Add New RSS Feed"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "edit" 
                ? "Update the feed configuration" 
                : "Configure your RSS feed to automatically import articles"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Rss className="w-5 h-5 text-primary" />
                {mode === "edit" ? "Feed Configuration" : "New Feed Configuration"}
              </CardTitle>
              <CardDescription>
                {mode === "edit" 
                  ? "Update the settings for this RSS feed"
                  : "Configure all settings for your new RSS feed"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Row 1: Feed Name + RSS Feed URL */}
                {/* Feed Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Feed Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., TechCrunch AI"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A friendly name to identify this feed
                  </p>
                </div>

                {/* RSS Feed URL */}
                <div className="space-y-2">
                  <Label htmlFor="feed_url">RSS Feed URL *</Label>
                  <Input
                    id="feed_url"
                    type="url"
                    value={formData.feed_url}
                    onChange={(e) => setFormData({ ...formData, feed_url: e.target.value })}
                    placeholder="https://example.com/feed.xml"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The full URL to the RSS or Atom feed
                  </p>
                </div>

                {/* Row 2: Target Vertical + Import Mode + Article Status (3 columns) */}
                <div className="lg:col-span-2 grid gap-6 lg:grid-cols-3">
                  {/* Target Vertical */}
                  <div className="space-y-2">
                    <Label htmlFor="vertical_slug">Target Vertical *</Label>
                    <Select
                      value={formData.vertical_slug}
                      onValueChange={(value) => setFormData({ ...formData, vertical_slug: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vertical" />
                      </SelectTrigger>
                      <SelectContent>
                        {verticals?.map((vertical: string) => (
                          <SelectItem key={vertical} value={vertical}>
                            {vertical}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">+ Add custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.vertical_slug === "__new__" && (
                      <Input
                        placeholder="Enter custom vertical slug"
                        onChange={(e) => setFormData({ ...formData, vertical_slug: e.target.value })}
                        className="mt-2"
                      />
                    )}
                  </div>

                  {/* Import Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="import_mode">Import Mode</Label>
                    <Select
                      value={formData.import_mode}
                      onValueChange={(value: ImportMode) => setFormData({ ...formData, import_mode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_content">Full Content</SelectItem>
                        <SelectItem value="excerpt_with_link">Excerpt + External Link</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {formData.import_mode === "full_content" 
                        ? "Import the complete article content"
                        : "Import excerpt and link to original article"}
                    </p>
                  </div>

                  {/* Article Status */}
                  <div className="space-y-2">
                    <Label htmlFor="publish_status">Article Status</Label>
                    <Select
                      value={formData.publish_status}
                      onValueChange={(value: PublishStatus) => setFormData({ ...formData, publish_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Save as Draft</SelectItem>
                        <SelectItem value="publish">Publish Immediately</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {formData.publish_status === "draft" 
                        ? "Review articles before publishing"
                        : "Articles go live immediately"}
                    </p>
                  </div>
                </div>

                {/* Auto-sync Toggle */}
                <div className="space-y-2">
                  <Label>Sync Settings</Label>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto_sync" className="text-sm font-medium">Enable Auto-sync</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically check for new articles
                      </p>
                    </div>
                    <Switch
                      id="auto_sync"
                      checked={formData.auto_sync}
                      onCheckedChange={(checked) => setFormData({ ...formData, auto_sync: checked })}
                    />
                  </div>
                </div>

                {/* Sync Interval */}
                <div className="space-y-2">
                  <Label htmlFor="sync_interval">Sync Interval</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="sync_interval"
                      type="number"
                      min="1"
                      max="168"
                      value={formData.sync_interval_hours}
                      onChange={(e) => setFormData({ ...formData, sync_interval_hours: parseInt(e.target.value) || 24 })}
                      disabled={!formData.auto_sync}
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">hours</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.auto_sync 
                      ? `Check every ${formData.sync_interval_hours} hour${formData.sync_interval_hours !== 1 ? 's' : ''}`
                      : "Enable auto-sync to configure interval"}
                  </p>
                </div>

                {/* Duplicate Checking - Full Width */}
                <div className="space-y-2 lg:col-span-2">
                  <Label>Duplicate Checking</Label>
                  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between flex-1 p-3 bg-background rounded-md border">
                      <div className="space-y-0.5">
                        <Label htmlFor="check_duplicate_title" className="text-sm font-medium">Check by Title</Label>
                        <p className="text-xs text-muted-foreground">
                          Skip articles with matching titles
                        </p>
                      </div>
                      <Switch
                        id="check_duplicate_title"
                        checked={formData.check_duplicate_title}
                        onCheckedChange={(checked) => setFormData({ ...formData, check_duplicate_title: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between flex-1 p-3 bg-background rounded-md border">
                      <div className="space-y-0.5">
                        <Label htmlFor="check_duplicate_link" className="text-sm font-medium">Check by Link</Label>
                        <p className="text-xs text-muted-foreground">
                          Skip articles with matching URLs
                        </p>
                      </div>
                      <Switch
                        id="check_duplicate_link"
                        checked={formData.check_duplicate_link}
                        onCheckedChange={(checked) => setFormData({ ...formData, check_duplicate_link: checked })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enable to prevent importing duplicate articles that already exist in the database
                  </p>
                </div>

                {/* Default Featured Image - Full Width */}
                <div className="space-y-2 lg:col-span-2">
                  <Label>Default Featured Image</Label>
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    {formData.default_image_url ? (
                      <div className="relative w-28 h-20 rounded-lg border border-border overflow-hidden flex-shrink-0 shadow-sm">
                        <img 
                          src={formData.default_image_url} 
                          alt="Default featured" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 shadow-lg"
                          onClick={() => setFormData({ ...formData, default_image_url: "" })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-28 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center bg-background flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="default_image_url" className="text-xs">Image URL</Label>
                        <Input
                          id="default_image_url"
                          type="url"
                          value={formData.default_image_url}
                          onChange={(e) => setFormData({ ...formData, default_image_url: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingImage}
                        onClick={() => document.getElementById("image_upload")?.click()}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload
                      </Button>
                      <input
                        id="image_upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for all articles from this feed that don't have an image
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg"
              disabled={createFeedMutation.isPending || updateFeedMutation.isPending}
            >
              {(createFeedMutation.isPending || updateFeedMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {mode === "edit" ? "Save Changes" : "Add Feed"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Render the list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Feeds Syndicator</h2>
          <p className="text-muted-foreground">
            Import and republish articles from RSS feeds
          </p>
        </div>
        <Button onClick={onAddFeed}>
          <Plus className="w-4 h-4 mr-2" />
          Add Feed
        </Button>
      </div>

      {feedsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : feeds && feeds.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feed</TableHead>
                  <TableHead>Vertical</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Import Mode</TableHead>
                  <TableHead>Last Synced</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeds.map((feed) => (
                  <TableRow key={feed.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {feed.default_image_url ? (
                          <img 
                            src={feed.default_image_url} 
                            alt="" 
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <Rss className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{feed.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {feed.feed_url}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{feed.vertical_slug}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(feed.status)}
                        {feed.auto_sync && (
                          <span className="text-xs text-muted-foreground">
                            Auto: every {feed.sync_interval_hours}h
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {feed.import_mode.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {feed.last_synced_at ? (
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {format(new Date(feed.last_synced_at), "MMM d, yyyy")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(feed.last_synced_at), "HH:mm")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                      {feed.last_error && (
                        <div className="flex items-center gap-1 text-destructive text-xs mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{feed.last_error}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => syncFeedMutation.mutate(feed.id)}
                          disabled={syncingFeedId === feed.id}
                          title="Sync now"
                        >
                          {syncingFeedId === feed.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeedStatus(feed)}
                          title={feed.status === "active" ? "Pause" : "Resume"}
                        >
                          {feed.status === "active" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditFeed?.(feed.id)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this feed?")) {
                              deleteFeedMutation.mutate(feed.id);
                            }
                          }}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Open feed URL"
                        >
                          <a href={feed.feed_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Rss className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>No RSS Feeds Yet</CardTitle>
            <CardDescription>
              Add your first RSS feed to start importing articles automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={onAddFeed}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Feed
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedsSyndicator;
