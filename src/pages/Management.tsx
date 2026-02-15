import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, Shield, Users, FileText, Settings } from "lucide-react";
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

type View = "dashboard" | "articles" | "new-article" | "tags" | "verticals" | "feeds-syndicator" | "new-feed" | "edit-feed" | "feeds-logs" | "default-images" | "batch-resize" | "og-generator" | "social-preview" | "settings-general" | "settings-analytics" | "settings-sitemaps" | "settings-robots";

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

            {/* Dashboard Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setCurrentView("articles")}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">Articles</CardTitle>
                  <CardDescription>Manage articles and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View, edit, and organize all published articles across verticals.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer opacity-60">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">Users</CardTitle>
                  <CardDescription>Manage user accounts and roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View user activity, manage roles, and handle permissions.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleViewChange("settings-general")}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">Settings</CardTitle>
                  <CardDescription>Platform configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure site settings, analytics, and sitemaps.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Section */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div 
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setCurrentView("articles")}
                >
                  <p className="text-2xl font-bold text-primary">{articleCount ?? "--"}</p>
                  <p className="text-sm text-muted-foreground">Total Articles</p>
                </div>
                <div 
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setCurrentView("verticals")}
                >
                  <p className="text-2xl font-bold text-primary">{verticalCount ?? "--"}</p>
                  <p className="text-sm text-muted-foreground">Verticals</p>
                </div>
                <div 
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setCurrentView("feeds-syndicator")}
                >
                  <p className="text-2xl font-bold text-primary">{feedsCount ?? "--"}</p>
                  <p className="text-sm text-muted-foreground">RSS Feeds</p>
                </div>
              </div>
            </div>
          </>
        );
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
