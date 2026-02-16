import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_ROBOTS_TXT = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://www.platodata.io/sitemap.xml
Sitemap: https://www.platodata.io/ar/sitemap.xml
Sitemap: https://www.platodata.io/bn/sitemap.xml
Sitemap: https://www.platodata.io/zh-CN/sitemap.xml
Sitemap: https://www.platodata.io/zh-TW/sitemap.xml
Sitemap: https://www.platodata.io/da/sitemap.xml
Sitemap: https://www.platodata.io/nl/sitemap.xml
Sitemap: https://www.platodata.io/et/sitemap.xml
Sitemap: https://www.platodata.io/fi/sitemap.xml
Sitemap: https://www.platodata.io/fr/sitemap.xml
Sitemap: https://www.platodata.io/de/sitemap.xml
Sitemap: https://www.platodata.io/el/sitemap.xml
Sitemap: https://www.platodata.io/iw/sitemap.xml
Sitemap: https://www.platodata.io/hi/sitemap.xml
Sitemap: https://www.platodata.io/hu/sitemap.xml
Sitemap: https://www.platodata.io/id/sitemap.xml
Sitemap: https://www.platodata.io/it/sitemap.xml
Sitemap: https://www.platodata.io/ja/sitemap.xml
Sitemap: https://www.platodata.io/km/sitemap.xml
Sitemap: https://www.platodata.io/ko/sitemap.xml
Sitemap: https://www.platodata.io/no/sitemap.xml
Sitemap: https://www.platodata.io/fa/sitemap.xml
Sitemap: https://www.platodata.io/pl/sitemap.xml
Sitemap: https://www.platodata.io/pt/sitemap.xml
Sitemap: https://www.platodata.io/pa/sitemap.xml
Sitemap: https://www.platodata.io/ro/sitemap.xml
Sitemap: https://www.platodata.io/ru/sitemap.xml
Sitemap: https://www.platodata.io/sl/sitemap.xml
Sitemap: https://www.platodata.io/es/sitemap.xml
Sitemap: https://www.platodata.io/sv/sitemap.xml
Sitemap: https://www.platodata.io/th/sitemap.xml
Sitemap: https://www.platodata.io/tr/sitemap.xml
Sitemap: https://www.platodata.io/uk/sitemap.xml
Sitemap: https://www.platodata.io/ur/sitemap.xml
Sitemap: https://www.platodata.io/vi/sitemap.xml`;

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
