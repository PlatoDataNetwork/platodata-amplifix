import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, Shield, FileText, Settings, Layers, Rss, Plus, ArrowRight, Clock, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

import { Helmet } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ArticleManagement from "@/components/admin/ArticleManagement";
import ArticleEditor from "@/components/admin/ArticleEditor";
import TagsManagement from "@/components/admin/TagsManagement";
import VerticalsManagement from "@/components/admin/VerticalsManagement";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import AnalyticsSettings from "@/components/admin/settings/AnalyticsSettings";
import SitemapsSettings from "@/components/admin/settings/SitemapsSettings";
import RobotsSettings from "@/components/admin/settings/RobotsSettings";
import FeedsSyndicator from "@/components/admin/FeedsSyndicator";
import FeedSyncLogs from "@/components/admin/FeedSyncLogs";
import DefaultFeaturedImages from "@/components/admin/DefaultFeaturedImages";
import OGImageGenerator from "@/components/admin/OGImageGenerator";
import SocialPreviewDebugger from "@/components/admin/SocialPreviewDebugger";
import BatchImageResizer from "@/components/admin/BatchImageResizer";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import SeoAutoTagger from "@/components/admin/SeoAutoTagger";

type View = "dashboard" | "analytics" | "articles" | "new-article" | "tags" | "verticals" | "feeds-syndicator" | "new-feed" | "edit-feed" | "feeds-logs" | "default-images" | "batch-resize" | "og-generator" | "social-preview" | "seo-auto-tagger" | "settings-general" | "settings-analytics" | "settings-sitemaps" | "settings-robots";

const Management = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [initialVerticalFilter, setInitialVerticalFilter] = useState<string | undefined>();
  const [initialFeedIdFilter, setInitialFeedIdFilter] = useState<string | undefined>();
  const [editingFeedId, setEditingFeedId] = useState<string | undefined>();

  const handleViewChange = (view: View, verticalSlug?: string) => {
    setCurrentView(view);
    setInitialVerticalFilter(verticalSlug);
    setInitialFeedIdFilter(undefined);
    if (view !== "edit-feed") {
      setEditingFeedId(undefined);
    }
  };

  const handleEditFeed = (feedId: string) => {
    setEditingFeedId(feedId);
    setCurrentView("edit-feed");
  };

  const handleViewArticlesByFeed = (feedId: string) => {
    setInitialFeedIdFilter(feedId);
    setInitialVerticalFilter(undefined);
    setCurrentView("articles");
  };

  // Fetch article count
  const { data: articleCount } = useQuery({
    queryKey: ["admin-article-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && isAdmin,
  });

  // Fetch vertical count
  const { data: verticalCount } = useQuery({
    queryKey: ["admin-vertical-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_article_verticals");
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user && isAdmin,
  });

  // Fetch RSS feeds count
  const { data: feedsCount } = useQuery({
    queryKey: ["admin-feeds-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("rss_feeds")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && isAdmin,
  });



  // Fetch recent articles
  const { data: recentArticles } = useQuery({
    queryKey: ["admin-recent-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, vertical_slug, author, published_at")
        .order("published_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAdmin,
  });

  // Fetch recent feed syncs
  const { data: recentFeeds } = useQuery({
    queryKey: ["admin-recent-feeds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rss_feeds")
        .select("id, name, status, last_synced_at, last_error")
        .order("last_synced_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAdmin,
  });



  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login", { replace: true });
      } else if (!isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, Admin</h2>
              <p className="text-muted-foreground">
                Manage your platform from this dashboard.
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Articles", value: articleCount, icon: FileText, onClick: () => setCurrentView("articles") },
                { label: "Verticals", value: verticalCount, icon: Layers, onClick: () => setCurrentView("verticals") },
                { label: "RSS Feeds", value: feedsCount, icon: Rss, onClick: () => setCurrentView("feeds-syndicator") },
                
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={stat.onClick}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value != null ? stat.value.toLocaleString() : "--"}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions + Feed Sync Status */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3"
                    onClick={() => setCurrentView("new-article")}
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    New Article
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3"
                    onClick={() => setCurrentView("new-feed")}
                  >
                    <Rss className="w-4 h-4 text-primary" />
                    Add Feed
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3"
                    onClick={() => setCurrentView("analytics")}
                  >
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3"
                    onClick={() => handleViewChange("settings-general")}
                  >
                    <Settings className="w-4 h-4 text-primary" />
                    Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">Feed Sync Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentFeeds && recentFeeds.length > 0 ? (
                    recentFeeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                        onClick={() => handleEditFeed(feed.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            feed.status === "active" ? "bg-green-500" : feed.status === "error" ? "bg-destructive" : "bg-muted-foreground"
                          }`} />
                          <span className="text-foreground truncate">{feed.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
                          {feed.last_synced_at
                            ? formatDistanceToNow(new Date(feed.last_synced_at), { addSuffix: true })
                            : "Never synced"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No feeds configured yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card className="bg-card border-border mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">Recent Articles</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentView("articles")} className="text-primary">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentArticles && recentArticles.length > 0 ? (
                  <div className="space-y-3">
                    {recentArticles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between gap-4 text-sm hover:bg-muted/50 rounded-md px-2 py-2 -mx-2 transition-colors cursor-pointer"
                        onClick={() => setCurrentView("articles")}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground font-medium truncate">{article.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{article.vertical_slug}</Badge>
                            {article.author && <span className="text-muted-foreground text-xs">{article.author}</span>}
                          </div>
                        </div>
                        <span className="text-muted-foreground text-xs flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No articles yet.</p>
                )}
              </CardContent>
            </Card>

          </>
        );
      case "analytics":
        return <AnalyticsDashboard />;
      case "articles":
        return (
          <ArticleManagement
            onBack={() => setCurrentView("dashboard")} 
            initialVertical={initialVerticalFilter}
            initialFeedId={initialFeedIdFilter}
          />
        );
      case "new-article":
        return (
          <ArticleEditor 
            onBack={() => setCurrentView("articles")} 
          />
        );
      case "tags":
        return <TagsManagement />;
      case "verticals":
        return <VerticalsManagement onNavigateToArticles={(slug) => handleViewChange("articles", slug)} />;
      case "feeds-syndicator":
        return (
          <FeedsSyndicator 
            onAddFeed={() => setCurrentView("new-feed")} 
            onEditFeed={handleEditFeed}
            onViewArticles={handleViewArticlesByFeed}
          />
        );
      case "new-feed":
        return (
          <FeedsSyndicator 
            mode="add" 
            onBack={() => setCurrentView("feeds-syndicator")} 
          />
        );
      case "edit-feed":
        return (
          <FeedsSyndicator 
            mode="edit" 
            editFeedId={editingFeedId}
            onBack={() => setCurrentView("feeds-syndicator")} 
          />
        );
      case "feeds-logs":
        return <FeedSyncLogs />;
      case "default-images":
        return <DefaultFeaturedImages />;
      case "batch-resize":
        return <BatchImageResizer />;
      case "og-generator":
        return <OGImageGenerator />;
      case "social-preview":
        return <SocialPreviewDebugger />;
      case "seo-auto-tagger":
        return <SeoAutoTagger />;
      case "settings-general":
        return <GeneralSettings />;
      case "settings-analytics":
        return <AnalyticsSettings />;
      case "settings-sitemaps":
        return <SitemapsSettings />;
      case "settings-robots":
        return <RobotsSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Management | Platodata</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <SidebarProvider defaultOpen>
        {/* Fixed Header - Full Width */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Admin Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Content with top padding for fixed header */}
        <div className="pt-[65px] w-full">
          <div className="min-h-[calc(100vh-65px)] flex w-full">
            <AdminSidebar currentView={currentView} onViewChange={handleViewChange} />
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Management;
