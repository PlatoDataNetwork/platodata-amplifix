import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
}

const defaultSettings: SiteSettings = {
  siteName: "Platodata",
  siteDescription: "AI-powered data intelligence platform",
};

export const useSiteSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings", "general"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["site_name", "site_description"]);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value || "";
      });

      return {
        siteName: settingsMap.site_name || defaultSettings.siteName,
        siteDescription: settingsMap.site_description || defaultSettings.siteDescription,
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    siteName: data?.siteName || defaultSettings.siteName,
    siteDescription: data?.siteDescription || defaultSettings.siteDescription,
    isLoading,
  };
};
