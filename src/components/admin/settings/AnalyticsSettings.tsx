import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save, BarChart3, Code } from "lucide-react";

const AnalyticsSettings = () => {
  const queryClient = useQueryClient();
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [customHeaderScripts, setCustomHeaderScripts] = useState("");

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings", "analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["google_analytics_id", "custom_header_scripts"]);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value || "";
      });
      return settingsMap;
    },
  });

  // Update local state when data loads
  useEffect(() => {
    if (settings) {
      setGoogleAnalyticsId(settings.google_analytics_id || "");
      setCustomHeaderScripts(settings.custom_header_scripts || "");
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        { key: "google_analytics_id", value: googleAnalyticsId },
        { key: "custom_header_scripts", value: customHeaderScripts },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: update.value })
          .eq("key", update.key);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Analytics settings saved successfully");
    },
    onError: (error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics & Scripts</h2>
        <p className="text-muted-foreground text-sm">
          Configure tracking and custom header scripts
        </p>
      </div>

      {/* Google Analytics Card */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">Google Analytics</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your Google Analytics measurement ID to track site visitors.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gaId">Measurement ID</Label>
          <Input
            id="gaId"
            value={googleAnalyticsId}
            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground">
            Find this in your Google Analytics 4 property settings.
          </p>
        </div>
      </div>

      {/* Custom Scripts Card */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Code className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">Custom Header Scripts</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add custom scripts to be included in the {"<head>"} section of your site.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customScripts">Scripts</Label>
          <Textarea
            id="customScripts"
            value={customHeaderScripts}
            onChange={(e) => setCustomHeaderScripts(e.target.value)}
            placeholder="<!-- Add your custom scripts here -->"
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Include complete {"<script>"} tags. Be careful with what you add here.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsSettings;
