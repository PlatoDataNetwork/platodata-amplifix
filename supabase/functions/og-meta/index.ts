import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.platodata.io";
const SITE_NAME = "Platodata";
const DEFAULT_IMAGE = `${SITE_URL}/images/article-default-img.jpg`;
const DEFAULT_DESCRIPTION = "Web3 AI code creation, automation, and vertical data intelligence. A decentralized, consensus-driven AI network ensuring trust & transparency.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");

    // If no postId, return default meta tags
    if (!postId) {
      return new Response(generateMetaHtml({
        title: `${SITE_NAME} - Secure Network Protocol for the Next Web`,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        type: "website",
      }), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Fetch article from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: article, error } = await supabase
      .from("articles")
      .select("title, excerpt, content, image_url, vertical_slug, published_at, author")
      .eq("post_id", parseInt(postId))
      .limit(1)
      .maybeSingle();

    if (error || !article) {
      return new Response(generateMetaHtml({
        title: `Article Not Found | ${SITE_NAME}`,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        type: "website",
      }), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Generate excerpt from content if not available
    const excerpt = article.excerpt || generateExcerpt(article.content, 160);
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const articleUrl = `${SITE_URL}/w3ai/${postId}/${article.vertical_slug}/${titleSlug}`;

    return new Response(generateMetaHtml({
      title: decodeHtmlEntities(article.title),
      description: decodeHtmlEntities(excerpt),
      image: article.image_url || DEFAULT_IMAGE,
      url: articleUrl,
      type: "article",
      author: article.author,
      publishedTime: article.published_at,
      section: formatVerticalName(article.vertical_slug),
    }), {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateMetaHtml(meta: {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  author?: string;
  publishedTime?: string;
  section?: string;
}): string {
  const articleMeta = meta.type === "article" ? `
    <meta property="article:published_time" content="${meta.publishedTime || ''}" />
    ${meta.author ? `<meta property="article:author" content="${meta.author}" />` : ''}
    ${meta.section ? `<meta property="article:section" content="${meta.section}" />` : ''}
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:url" content="${meta.url}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@PlatoDataIO" />
  <meta name="twitter:url" content="${meta.url}" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${meta.image}" />
  
  ${articleMeta}
  
  <link rel="canonical" href="${meta.url}" />
</head>
<body>
  <script>window.location.href = "${meta.url}";</script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${meta.url}" />
  </noscript>
  <p>Redirecting to <a href="${meta.url}">${escapeHtml(meta.title)}</a>...</p>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeHtmlEntities(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, "...")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ");
}

function generateExcerpt(content: string | null, maxLength: number): string {
  if (!content) return "";
  const strippedContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const decodedContent = decodeHtmlEntities(strippedContent);
  if (decodedContent.length <= maxLength) return decodedContent;
  const truncated = decodedContent.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

function formatVerticalName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
