import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GoogleAnalytics = () => {
  // Fetch Google Analytics ID from settings
  const { data: gaId } = useQuery({
    queryKey: ["site-settings", "google_analytics_id"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "google_analytics_id")
        .maybeSingle();

      if (error) throw error;
      return data?.value || null;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    // Only load if we have a valid GA ID
    if (!gaId || gaId.trim() === "") return;

    // Check if script already exists
    const existingScript = document.getElementById("ga-script");
    if (existingScript) return;

    // Create and inject the gtag.js script
    const script = document.createElement("script");
    script.id = "ga-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    const inlineScript = document.createElement("script");
    inlineScript.id = "ga-config";
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(inlineScript);

    // Cleanup on unmount
    return () => {
      const gaScript = document.getElementById("ga-script");
      const gaConfig = document.getElementById("ga-config");
      if (gaScript) gaScript.remove();
      if (gaConfig) gaConfig.remove();
    };
  }, [gaId]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
