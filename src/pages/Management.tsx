import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, Shield, Users, FileText, Settings } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Management = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signOut } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Management | Platodata</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, Admin</h2>
          <p className="text-muted-foreground">
            Manage your platform from this dashboard.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
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

          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
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

          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Settings</CardTitle>
              <CardDescription>Platform configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure site settings, API keys, and integrations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">--</p>
              <p className="text-sm text-muted-foreground">Total Articles</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">--</p>
              <p className="text-sm text-muted-foreground">Verticals</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">--</p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">--</p>
              <p className="text-sm text-muted-foreground">API Calls Today</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Management;
