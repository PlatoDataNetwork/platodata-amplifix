import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Map, Copy, ExternalLink } from "lucide-react";

const SitemapsSettings = () => {
  const sitemapUrl = "https://tmmerifhwscgicmncndl.supabase.co/functions/v1/sitemap";

  const handleCopy = () => {
    navigator.clipboard.writeText(sitemapUrl);
    toast.success("Sitemap URL copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sitemaps</h2>
        <p className="text-muted-foreground text-sm">
          View and manage your XML sitemap for search engines
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Map className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">What is a Sitemap?</p>
            <p className="text-sm text-muted-foreground mt-1">
              A sitemap is an XML file that lists all the pages on your site. Search engines like Google use sitemaps to discover and index your content more efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* Sitemap URL Card */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <Label htmlFor="sitemapUrl">Sitemap URL</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Submit this URL to Google Search Console and other search engines.
          </p>
          <div className="flex gap-2">
            <Input
              id="sitemapUrl"
              value={sitemapUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-foreground">How to Submit Your Sitemap</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Copy the sitemap URL above</li>
          <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Search Console</a></li>
          <li>Select your property (or add your site if not already added)</li>
          <li>Navigate to "Sitemaps" in the left sidebar</li>
          <li>Paste the sitemap URL and click "Submit"</li>
        </ol>
      </div>
    </div>
  );
};

export default SitemapsSettings;
