import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.platodata.io";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all articles
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("title, post_id, vertical_slug, published_at, updated_at")
      .order("published_at", { ascending: false });

    if (articlesError) {
      throw articlesError;
    }

    // Fetch unique verticals
    const { data: verticals, error: verticalsError } = await supabase
      .rpc("get_article_verticals");

    if (verticalsError) {
      throw verticalsError;
    }

    // Helper function to generate article URL slug
    const generateArticleSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    };

    // Helper function to format date for sitemap
    const formatDate = (dateString: string | null) => {
      if (!dateString) return new Date().toISOString().split("T")[0];
      return new Date(dateString).toISOString().split("T")[0];
    };

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/intel</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/solutions</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // Add vertical pages
    if (verticals) {
      for (const v of verticals) {
        xml += `  <url>
    <loc>${SITE_URL}/intel/${v.vertical_slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // Add article pages
    if (articles) {
      for (const article of articles) {
        const titleSlug = generateArticleSlug(article.title);
        const articleUrl = `${SITE_URL}/w3ai/${article.post_id}/${article.vertical_slug}/${titleSlug}`;
        const lastmod = formatDate(article.updated_at || article.published_at);
        
        xml += `  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
