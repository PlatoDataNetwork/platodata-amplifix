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

    console.log(`Generating JSON feed: vertical=${vertical}, limit=${limit}`);

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

    // Helper function to generate article URL slug
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);
    };

    // Helper to strip HTML tags for summary
    const stripHtml = (html: string | null): string => {
      if (!html) return "";
      return html.replace(/<[^>]*>/g, "").substring(0, 500);
    };

    const feedTitle = vertical 
      ? `${SITE_NAME} - ${vertical.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} Feed`
      : `${SITE_NAME} Feed`;
    
    const homePageUrl = vertical ? `${SITE_URL}/w3ai/vertical/${vertical}` : `${SITE_URL}/intel`;
    const feedUrl = vertical ? `${SITE_URL}/feed/${vertical}.json` : `${SITE_URL}/feed.json`;

    // JSON Feed 1.1 format
    const jsonFeed = {
      version: "https://jsonfeed.org/version/1.1",
      title: feedTitle,
      home_page_url: homePageUrl,
      feed_url: feedUrl,
      description: SITE_DESCRIPTION,
      icon: `${SITE_URL}/favicon.png`,
      favicon: `${SITE_URL}/favicon.ico`,
      language: "en-US",
      authors: [
        {
          name: SITE_NAME,
          url: SITE_URL
        }
      ],
      items: (articles || []).map(article => {
        const slug = generateSlug(article.title);
        const articleUrl = `${SITE_URL}/w3ai/${article.post_id}/${article.vertical_slug}/${slug}`;
        
        const item: Record<string, unknown> = {
          id: articleUrl,
          url: articleUrl,
          title: article.title,
          date_published: article.published_at,
          summary: article.excerpt || stripHtml(article.content),
        };

        if (article.content) {
          item.content_html = article.content;
        }

        if (article.updated_at && article.updated_at !== article.published_at) {
          item.date_modified = article.updated_at;
        }

        if (article.author) {
          item.authors = [{ name: article.author }];
        }

        if (article.image_url) {
          item.image = article.image_url;
          item.banner_image = article.image_url;
        }

        const tags: string[] = [];
        if (article.category) tags.push(article.category);
        if (article.vertical_slug) tags.push(article.vertical_slug.replace(/-/g, " "));
        if (tags.length > 0) {
          item.tags = tags;
        }

        return item;
      })
    };

    console.log(`JSON feed generated with ${articles?.length || 0} articles`);

    return new Response(JSON.stringify(jsonFeed, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/feed+json; charset=utf-8",
        "Cache-Control": "public, max-age=1800", // Cache for 30 minutes
      },
    });
  } catch (error) {
    console.error("JSON feed generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate JSON feed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
