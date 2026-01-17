import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GoogleAnalytics = () => {
  // Fetch analytics settings
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "analytics-scripts"],
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const gaId = settings?.google_analytics_id;
  const customScripts = settings?.custom_header_scripts;

  // Inject Google Analytics
  useEffect(() => {
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

    return () => {
      const gaScript = document.getElementById("ga-script");
      const gaConfig = document.getElementById("ga-config");
      if (gaScript) gaScript.remove();
      if (gaConfig) gaConfig.remove();
    };
  }, [gaId]);

  // Inject custom header scripts
  useEffect(() => {
    if (!customScripts || customScripts.trim() === "") return;

    // Check if already injected
    const existingContainer = document.getElementById("custom-header-scripts");
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create a container div to hold the scripts
    const container = document.createElement("div");
    container.id = "custom-header-scripts";
    container.innerHTML = customScripts;

    // Extract and execute scripts properly
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      
      // Copy attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      }
      
      document.head.appendChild(newScript);
    });

    // Also append non-script elements (like meta tags, link tags, etc.)
    const nonScripts = Array.from(container.children).filter(
      (el) => el.tagName.toLowerCase() !== "script"
    );
    nonScripts.forEach((el) => {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-custom-header", "true");
      document.head.appendChild(clone);
    });

    return () => {
      // Cleanup custom scripts and elements
      document.querySelectorAll("#custom-header-scripts script").forEach((s) => s.remove());
      document.querySelectorAll("[data-custom-header]").forEach((el) => el.remove());
    };
  }, [customScripts]);

  return null;
};

export default GoogleAnalytics;
