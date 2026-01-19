import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.platodata.io";
const ARTICLES_PER_SITEMAP = 5000;

// XML namespace declarations matching Rank Math Pro
const SITEMAP_INDEX_XMLNS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
const URLSET_XMLNS = `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "sitemap_index.xml";
    
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

    // Helper function to format date for sitemap (W3C Datetime format)
    const formatDate = (dateString: string | null) => {
      if (!dateString) return new Date().toISOString();
      return new Date(dateString).toISOString();
    };

    // Helper to escape XML special characters
    const escapeXml = (str: string | null) => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // Helper to return XML response with proper headers
    const xmlResponse = (xml: string) => {
      return new Response(xml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "X-Robots-Tag": "noindex, follow",
        },
      });
    };

    // Get last modified date for post sitemaps
    const getPostSitemapLastMod = async (pageNum: number) => {
      const startOffset = (pageNum - 1) * ARTICLES_PER_SITEMAP;
      const { data } = await supabase
        .from("articles")
        .select("updated_at, published_at")
        .order("published_at", { ascending: false })
        .range(startOffset, startOffset)
        .limit(1);
      
      if (data && data.length > 0) {
        return formatDate(data[0].updated_at || data[0].published_at);
      }
      return new Date().toISOString();
    };

    // Main sitemap index (supports both sitemap_index.xml and sitemap.xml)
    if (path === "sitemap_index.xml" || path === "sitemap.xml") {
      // Get total article count to determine number of post sitemaps
      const { count, error: countError } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const totalArticles = count || 0;
      const numPostSitemaps = Math.ceil(totalArticles / ARTICLES_PER_SITEMAP);
      const now = new Date().toISOString();

      // Get actual last modified dates for each sitemap
      const postSitemapLastMods: string[] = [];
      for (let i = 1; i <= numPostSitemaps; i++) {
        const lastMod = await getPostSitemapLastMod(i);
        postSitemapLastMods.push(lastMod);
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>\n`;
      xml += `<sitemapindex ${SITEMAP_INDEX_XMLNS}>\n`;

      // Page sitemap
      xml += `\t<sitemap>\n`;
      xml += `\t\t<loc>${SITE_URL}/page-sitemap.xml</loc>\n`;
      xml += `\t\t<lastmod>${now}</lastmod>\n`;
      xml += `\t</sitemap>\n`;

      // Category sitemap (verticals)
      xml += `\t<sitemap>\n`;
      xml += `\t\t<loc>${SITE_URL}/category-sitemap.xml</loc>\n`;
      xml += `\t\t<lastmod>${now}</lastmod>\n`;
      xml += `\t</sitemap>\n`;

      // Post sitemaps
      for (let i = 1; i <= numPostSitemaps; i++) {
        xml += `\t<sitemap>\n`;
        xml += `\t\t<loc>${SITE_URL}/post-sitemap${i}.xml</loc>\n`;
        xml += `\t\t<lastmod>${postSitemapLastMods[i - 1]}</lastmod>\n`;
        xml += `\t</sitemap>\n`;
      }

      xml += `</sitemapindex>`;
      return xmlResponse(xml);
    }

    // Page sitemap - static pages
    if (path === "page-sitemap.xml") {
      const now = new Date().toISOString();
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>\n`;
      xml += `<urlset ${URLSET_XMLNS}>\n`;

      // Homepage
      xml += `\t<url>\n`;
      xml += `\t\t<loc>${SITE_URL}/</loc>\n`;
      xml += `\t\t<lastmod>${now}</lastmod>\n`;
      xml += `\t</url>\n`;

      // Intel page
      xml += `\t<url>\n`;
      xml += `\t\t<loc>${SITE_URL}/intel</loc>\n`;
      xml += `\t\t<lastmod>${now}</lastmod>\n`;
      xml += `\t</url>\n`;

      // Solutions page
      xml += `\t<url>\n`;
      xml += `\t\t<loc>${SITE_URL}/solutions</loc>\n`;
      xml += `\t\t<lastmod>${now}</lastmod>\n`;
      xml += `\t</url>\n`;

      xml += `</urlset>`;
      return xmlResponse(xml);
    }

    // Category sitemap (verticals) - matches Rank Math's category-sitemap.xml
    if (path === "category-sitemap.xml" || path === "vertical-sitemap.xml") {
      const { data: verticals, error: verticalsError } = await supabase
        .rpc("get_article_verticals");

      if (verticalsError) throw verticalsError;

      const now = new Date().toISOString();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>\n`;
      xml += `<urlset ${URLSET_XMLNS}>\n`;

      if (verticals) {
        for (const v of verticals) {
          xml += `\t<url>\n`;
          xml += `\t\t<loc>${SITE_URL}/w3ai/vertical/${escapeXml(v.vertical_slug)}</loc>\n`;
          xml += `\t\t<lastmod>${now}</lastmod>\n`;
          xml += `\t</url>\n`;
        }
      }

      xml += `</urlset>`;
      return xmlResponse(xml);
    }

    // Post sitemaps - articles paginated with image support
    const postSitemapMatch = path.match(/^post-sitemap(\d+)\.xml$/);
    if (postSitemapMatch) {
      const pageNum = parseInt(postSitemapMatch[1], 10);
      const startOffset = (pageNum - 1) * ARTICLES_PER_SITEMAP;
      
      // Fetch articles in batches of 1000 (Supabase default limit)
      const BATCH_SIZE = 1000;
      const allArticles: Array<{
        title: string;
        post_id: number;
        vertical_slug: string;
        published_at: string;
        updated_at: string | null;
        image_url: string | null;
      }> = [];
      
      for (let i = 0; i < ARTICLES_PER_SITEMAP; i += BATCH_SIZE) {
        const { data: batch, error: batchError } = await supabase
          .from("articles")
          .select("title, post_id, vertical_slug, published_at, updated_at, image_url")
          .order("published_at", { ascending: false })
          .range(startOffset + i, startOffset + i + BATCH_SIZE - 1);

        if (batchError) throw batchError;
        
        if (!batch || batch.length === 0) break;
        allArticles.push(...batch);
        
        // If we got less than BATCH_SIZE, no more articles to fetch
        if (batch.length < BATCH_SIZE) break;
      }

      const articles = allArticles;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>\n`;
      xml += `<urlset ${URLSET_XMLNS}>\n`;

      if (articles && articles.length > 0) {
        for (const article of articles) {
          const titleSlug = generateArticleSlug(article.title);
          const articleUrl = `${SITE_URL}/w3ai/${article.post_id}/${escapeXml(article.vertical_slug)}/${titleSlug}`;
          const lastmod = formatDate(article.updated_at || article.published_at);

          xml += `\t<url>\n`;
          xml += `\t\t<loc>${articleUrl}</loc>\n`;
          xml += `\t\t<lastmod>${lastmod}</lastmod>\n`;

          // Add image tag if image_url exists (Rank Math Pro style)
          if (article.image_url) {
            xml += `\t\t<image:image>\n`;
            xml += `\t\t\t<image:loc>${escapeXml(article.image_url)}</image:loc>\n`;
            xml += `\t\t\t<image:title>${escapeXml(article.title)}</image:title>\n`;
            xml += `\t\t</image:image>\n`;
          }

          xml += `\t</url>\n`;
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
