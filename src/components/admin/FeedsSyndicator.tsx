import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ExternalLink
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
}

interface FeedFormData {
  name: string;
  feed_url: string;
  vertical_slug: string;
  import_mode: ImportMode;
  publish_status: PublishStatus;
  auto_sync: boolean;
  sync_interval_hours: number;
}

const defaultFormData: FeedFormData = {
  name: "",
  feed_url: "",
  vertical_slug: "",
  import_mode: "full_content",
  publish_status: "draft",
  auto_sync: false,
  sync_interval_hours: 24,
};

const FeedsSyndicator = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [formData, setFormData] = useState<FeedFormData>(defaultFormData);
  const [syncingFeedId, setSyncingFeedId] = useState<string | null>(null);

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
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      setIsAddDialogOpen(false);
      setFormData(defaultFormData);
      toast.success("Feed added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add feed: ${error.message}`);
    },
  });

  // Update feed mutation
  const updateFeedMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FeedFormData> }) => {
      const { error } = await supabase.from("rss_feeds").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      setEditingFeed(null);
      setFormData(defaultFormData);
      toast.success("Feed updated successfully");
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
    if (editingFeed) {
      updateFeedMutation.mutate({ id: editingFeed.id, data: formData });
    } else {
      createFeedMutation.mutate(formData);
    }
  };

  const openEditDialog = (feed: RssFeed) => {
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      feed_url: feed.feed_url,
      vertical_slug: feed.vertical_slug,
      import_mode: feed.import_mode,
      publish_status: feed.publish_status,
      auto_sync: feed.auto_sync,
      sync_interval_hours: feed.sync_interval_hours,
    });
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingFeed(null);
    setFormData(defaultFormData);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Feeds Syndicator</h2>
          <p className="text-muted-foreground">
            Import and republish articles from RSS feeds
          </p>
        </div>
        <Dialog open={isAddDialogOpen || !!editingFeed} onOpenChange={(open) => {
          if (!open) closeDialog();
          else setIsAddDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Feed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingFeed ? "Edit Feed" : "Add New RSS Feed"}</DialogTitle>
                <DialogDescription>
                  {editingFeed 
                    ? "Update the feed configuration" 
                    : "Add an RSS feed to import articles automatically"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Feed Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., TechCrunch AI"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feed_url">RSS Feed URL</Label>
                  <Input
                    id="feed_url"
                    type="url"
                    value={formData.feed_url}
                    onChange={(e) => setFormData({ ...formData, feed_url: e.target.value })}
                    placeholder="https://example.com/feed.xml"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vertical_slug">Target Vertical</Label>
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
                </div>
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
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto_sync">Auto-sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync at regular intervals
                    </p>
                  </div>
                  <Switch
                    id="auto_sync"
                    checked={formData.auto_sync}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_sync: checked })}
                  />
                </div>
                {formData.auto_sync && (
                  <div className="space-y-2">
                    <Label htmlFor="sync_interval">Sync Interval (hours)</Label>
                    <Input
                      id="sync_interval"
                      type="number"
                      min="1"
                      max="168"
                      value={formData.sync_interval_hours}
                      onChange={(e) => setFormData({ ...formData, sync_interval_hours: parseInt(e.target.value) || 24 })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFeedMutation.isPending || updateFeedMutation.isPending}
                >
                  {(createFeedMutation.isPending || updateFeedMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingFeed ? "Update Feed" : "Add Feed"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                        <Rss className="w-4 h-4 text-muted-foreground" />
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
                          onClick={() => openEditDialog(feed)}
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
            <Button onClick={() => setIsAddDialogOpen(true)}>
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
