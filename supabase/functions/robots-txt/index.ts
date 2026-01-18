import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: https://www.platodata.io/sitemap.xml`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching robots.txt content from database...");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch robots.txt content from site_settings
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "robots_txt")
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      // Return default robots.txt on error
      return new Response(DEFAULT_ROBOTS_TXT, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    const robotsTxtContent = data?.value || DEFAULT_ROBOTS_TXT;
    console.log("Successfully fetched robots.txt content");

    return new Response(robotsTxtContent, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error serving robots.txt:", error);
    
    // Return default robots.txt on any error
    return new Response(DEFAULT_ROBOTS_TXT, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  }
});
