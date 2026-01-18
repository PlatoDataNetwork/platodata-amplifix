import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.platodata.io";
const SITE_NAME = "PlatoData";
const SITE_DESCRIPTION = "Data Intelligence Network for AI, Web3, Blockchain and Emerging Technology";
const MAX_ITEMS = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const vertical = url.searchParams.get("vertical");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), MAX_ITEMS);

    console.log(`Generating RSS feed: vertical=${vertical}, limit=${limit}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from("articles")
      .select("id, title, excerpt, content, author, published_at, updated_at, vertical_slug, category, image_url, post_id")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (vertical) {
      query = query.eq("vertical_slug", vertical);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Helper function to escape XML special characters
    const escapeXml = (str: string | null): string => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // Helper function to generate article URL slug
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);
    };

    // Helper to strip HTML tags for description
    const stripHtml = (html: string | null): string => {
      if (!html) return "";
      return html.replace(/<[^>]*>/g, "").substring(0, 500);
    };

    // Format date for RSS (RFC 822)
    const formatRssDate = (dateString: string | null): string => {
      if (!dateString) return new Date().toUTCString();
      return new Date(dateString).toUTCString();
    };

    const feedTitle = vertical 
      ? `${SITE_NAME} - ${vertical.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} Feed`
      : `${SITE_NAME} Feed`;
    
    const feedLink = vertical ? `${SITE_URL}/w3ai/vertical/${vertical}` : `${SITE_URL}/intel`;
    const lastBuildDate = articles && articles.length > 0 
      ? formatRssDate(articles[0].published_at) 
      : formatRssDate(null);

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${feedLink}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed${vertical ? `/${vertical}` : ""}.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.png</url>
      <title>${escapeXml(feedTitle)}</title>
      <link>${feedLink}</link>
    </image>
`;

    if (articles && articles.length > 0) {
      for (const article of articles) {
        const slug = generateSlug(article.title);
        const articleUrl = `${SITE_URL}/w3ai/${article.post_id}/${article.vertical_slug}/${slug}`;
        const description = article.excerpt || stripHtml(article.content);
        const pubDate = formatRssDate(article.published_at);

        rss += `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
`;

        if (article.content) {
          rss += `      <content:encoded><![CDATA[${article.content}]]></content:encoded>
`;
        }

        if (article.author) {
          rss += `      <dc:creator>${escapeXml(article.author)}</dc:creator>
`;
        }

        if (article.category) {
          rss += `      <category>${escapeXml(article.category)}</category>
`;
        }

        if (article.vertical_slug) {
          rss += `      <category>${escapeXml(article.vertical_slug.replace(/-/g, " "))}</category>
`;
        }

        if (article.image_url) {
          rss += `      <enclosure url="${escapeXml(article.image_url)}" type="image/jpeg"/>
`;
        }

        rss += `    </item>
`;
      }
    }

    rss += `  </channel>
</rss>`;

    console.log(`RSS feed generated with ${articles?.length || 0} articles`);

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800", // Cache for 30 minutes
      },
    });
  } catch (error) {
    console.error("RSS feed generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate RSS feed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
