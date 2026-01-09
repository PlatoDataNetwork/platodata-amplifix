import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.platodata.io";
const ARTICLES_PER_SITEMAP = 5000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "sitemap.xml";
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Helper to return XML response
    const xmlResponse = (xml: string) => {
      return new Response(xml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    };

    // Main sitemap index
    if (path === "sitemap.xml") {
      // Get total article count to determine number of post sitemaps
      const { count, error: countError } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const totalArticles = count || 0;
      const numPostSitemaps = Math.ceil(totalArticles / ARTICLES_PER_SITEMAP);
      const today = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/page-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/vertical-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
`;

      for (let i = 1; i <= numPostSitemaps; i++) {
        xml += `  <sitemap>
    <loc>${SITE_URL}/post-sitemap${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
`;
      }

      xml += `</sitemapindex>`;
      return xmlResponse(xml);
    }

    // Page sitemap - static pages
    if (path === "page-sitemap.xml") {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
</urlset>`;
      return xmlResponse(xml);
    }

    // Vertical sitemap
    if (path === "vertical-sitemap.xml") {
      const { data: verticals, error: verticalsError } = await supabase
        .rpc("get_article_verticals");

      if (verticalsError) throw verticalsError;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

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

      xml += `</urlset>`;
      return xmlResponse(xml);
    }

    // Post sitemaps - articles paginated
    const postSitemapMatch = path.match(/^post-sitemap(\d+)\.xml$/);
    if (postSitemapMatch) {
      const pageNum = parseInt(postSitemapMatch[1], 10);
      const offset = (pageNum - 1) * ARTICLES_PER_SITEMAP;

      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("title, post_id, vertical_slug, published_at, updated_at")
        .order("published_at", { ascending: false })
        .range(offset, offset + ARTICLES_PER_SITEMAP - 1);

      if (articlesError) throw articlesError;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      if (articles && articles.length > 0) {
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
      return xmlResponse(xml);
    }

    // Unknown sitemap path
    return new Response("Not Found", { status: 404, headers: corsHeaders });

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
