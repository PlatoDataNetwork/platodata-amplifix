import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.platodata.io";
const ARTICLES_PER_SITEMAP = 5000;

// XSL stylesheet URL - served from the same domain to avoid CORS issues
const XSL_URL = `${SITE_URL}/sitemap.xsl`;

// Supported languages (excluding English which is the default)
const SUPPORTED_LANGUAGES = [
  "ar","bn","zh-CN","zh-TW","da","nl","et","fi","fr","de","el","iw","hi",
  "hu","id","it","ja","km","ko","no","fa","pl","pt","pa","ro","ru","sl",
  "es","sv","th","tr","uk","ur","vi"
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "sitemap.xml";
    const lang = url.searchParams.get("lang") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // URL prefix for the current language
    const langPrefix = lang ? `/${lang}` : "";
    const baseUrl = `${SITE_URL}${langPrefix}`;

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
      const { count, error: countError } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const totalArticles = count || 0;
      const numPostSitemaps = Math.ceil(totalArticles / ARTICLES_PER_SITEMAP);
      const today = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${XSL_URL}"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/page-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/vertical-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
`;

      for (let i = 1; i <= numPostSitemaps; i++) {
        xml += `  <sitemap>
    <loc>${baseUrl}/post-sitemap${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
`;
      }

      // If this is the root (English) sitemap index, also link to all language sitemap indexes
      if (!lang) {
        for (const langCode of SUPPORTED_LANGUAGES) {
          xml += `  <sitemap>
    <loc>${SITE_URL}/${langCode}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
`;
        }
      }

      xml += `</sitemapindex>`;
      return xmlResponse(xml);
    }

    // Page sitemap - static pages
    if (path === "page-sitemap.xml") {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${XSL_URL}"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/intel</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/solutions</loc>
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
<?xml-stylesheet type="text/xsl" href="${XSL_URL}"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      if (verticals) {
        for (const v of verticals) {
          xml += `  <url>
    <loc>${baseUrl}/w3ai/vertical/${v.vertical_slug}</loc>
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
      const startOffset = (pageNum - 1) * ARTICLES_PER_SITEMAP;

      const BATCH_SIZE = 1000;
      const allArticles: Array<{
        title: string;
        post_id: number;
        vertical_slug: string;
        published_at: string;
        updated_at: string | null;
      }> = [];

      for (let i = 0; i < ARTICLES_PER_SITEMAP; i += BATCH_SIZE) {
        const { data: batch, error: batchError } = await supabase
          .from("articles")
          .select("title, post_id, vertical_slug, published_at, updated_at")
          .order("published_at", { ascending: false })
          .range(startOffset + i, startOffset + i + BATCH_SIZE - 1);

        if (batchError) throw batchError;
        if (!batch || batch.length === 0) break;
        allArticles.push(...batch);
        if (batch.length < BATCH_SIZE) break;
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${XSL_URL}"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      for (const article of allArticles) {
        const titleSlug = generateArticleSlug(article.title);
        const articleUrl = `${baseUrl}/w3ai/${article.post_id}/${article.vertical_slug}/${titleSlug}`;
        const lastmod = formatDate(article.updated_at || article.published_at);

        xml += `  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
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
