import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://www.platodata.io";
const SITE_NAME = "Platodata";
const DEFAULT_IMAGE = `${SITE_URL}/images/article-default-img.jpg`;
const DEFAULT_DESCRIPTION =
  "Web3 AI code creation, automation, and vertical data intelligence. A decentralized, consensus-driven AI network ensuring trust & transparency.";

/**
 * Build an HTML Response that forces the correct MIME type.
 * Using a Blob ensures the runtime cannot override Content-Type.
 */
function htmlResponse(html: string, isHead: boolean): Response {
  const blob = new Blob([html], { type: "text/html; charset=utf-8" });
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=300");
  return new Response(isHead ? null : blob, { status: 200, headers });
}

function jsonResponse(body: unknown, status = 200): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const isHead = req.method === "HEAD";

  // Lightweight logging for debugging crawler traffic
  try {
    const ua = req.headers.get("user-agent") || "";
    const urlObj = new URL(req.url);
    const postIdFromQuery = urlObj.searchParams.get("postId");
    console.info(
      `[og-meta] ${req.method} postId=${postIdFromQuery ?? ""} ua=${ua.slice(0, 120)}`
    );
  } catch {
    // ignore
  }

  try {
    const url = new URL(req.url);
    let postId = url.searchParams.get("postId");

    // Also extract postId from path if present (e.g., /w3ai/123456/vertical/slug)
    if (!postId) {
      const pathMatch = url.pathname.match(/\/w3ai\/(\d+)/);
      if (pathMatch) {
        postId = pathMatch[1];
      }
    }

    // If no postId, return default meta tags
    if (!postId) {
      const html = generateMetaHtml({
        title: `${SITE_NAME} - Secure Network Protocol for the Next Web`,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        type: "website",
      });
      return htmlResponse(html, isHead);
    }

    // Fetch article from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: article, error } = await supabase
      .from("articles")
      .select(
        "title, excerpt, content, image_url, vertical_slug, published_at, author"
      )
      .eq("post_id", parseInt(postId))
      .limit(1)
      .maybeSingle();

    if (error || !article) {
      const html = generateMetaHtml({
        title: `Article Not Found | ${SITE_NAME}`,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        type: "website",
      });
      return htmlResponse(html, isHead);
    }

    // Generate excerpt from content if not available
    const excerpt = article.excerpt || generateExcerpt(article.content, 160);
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const articleUrl = `${SITE_URL}/w3ai/${postId}/${article.vertical_slug}/${titleSlug}`;

    const html = generateMetaHtml({
      title: decodeHtmlEntities(article.title),
      description: decodeHtmlEntities(excerpt),
      image: article.image_url || DEFAULT_IMAGE,
      url: articleUrl,
      type: "article",
      author: article.author,
      publishedTime: article.published_at,
      section: formatVerticalName(article.vertical_slug),
    });

    return htmlResponse(html, isHead);
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: errorMessage }, 500);
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
  const articleMeta =
    meta.type === "article"
      ? `
    <meta property="article:published_time" content="${meta.publishedTime || ""}" />
    ${meta.author ? `<meta property="article:author" content="${meta.author}" />` : ""}
    ${meta.section ? `<meta property="article:section" content="${meta.section}" />` : ""}
  `
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:url" content="${meta.url}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:image:secure_url" content="${meta.image}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(meta.title)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@PlatoDataIO" />
  <meta name="twitter:url" content="${meta.url}" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${meta.image}" />
  <meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />

  ${articleMeta}

  <link rel="canonical" href="${meta.url}" />
</head>
<body>
  <main>
    <h1>${escapeHtml(meta.title)}</h1>
    <p>${escapeHtml(meta.description)}</p>
    <p><a href="${meta.url}">Open article</a></p>
  </main>
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
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
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
  const strippedContent = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
