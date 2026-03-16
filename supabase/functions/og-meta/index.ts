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

// Supported languages for hreflang alternates
const SUPPORTED_LANGS = [
  "en","ar","bn","zh-CN","zh-TW","da","nl","et","fi","fr","de","el","iw","hi",
  "hu","id","it","ja","km","ko","no","fa","pl","pt","pa","ro","ru","sl","es",
  "sv","th","tr","uk","ur","vi"
];

// Map language codes to og:locale format
function langToOgLocale(lang: string): string {
  const map: Record<string, string> = {
    en: "en_US", ar: "ar_SA", bn: "bn_BD", "zh-CN": "zh_CN", "zh-TW": "zh_TW",
    da: "da_DK", nl: "nl_NL", et: "et_EE", fi: "fi_FI", fr: "fr_FR",
    de: "de_DE", el: "el_GR", iw: "he_IL", hi: "hi_IN", hu: "hu_HU",
    id: "id_ID", it: "it_IT", ja: "ja_JP", km: "km_KH", ko: "ko_KR",
    no: "nb_NO", fa: "fa_IR", pl: "pl_PL", pt: "pt_PT", pa: "pa_IN",
    ro: "ro_RO", ru: "ru_RU", sl: "sl_SI", es: "es_ES", sv: "sv_SE",
    th: "th_TH", tr: "tr_TR", uk: "uk_UA", ur: "ur_PK", vi: "vi_VN",
  };
  return map[lang] || "en_US";
}

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
    const lang = url.searchParams.get("lang") || "en";

    if (!postId) {
      const pathMatch = url.pathname.match(/\/w3ai\/(\d+)/);
      if (pathMatch) {
        postId = pathMatch[1];
      }
    }

    if (!postId) {
      const html = generateMetaHtml({
        title: `${SITE_NAME} - Secure Network Protocol for the Next Web`,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        type: "website",
        lang,
      });
      return htmlResponse(html, isHead);
    }

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
        lang,
      });
      return htmlResponse(html, isHead);
    }

    const excerpt = article.excerpt || generateExcerpt(article.content, 160);
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    // Build URL with lang prefix if not English
    const articlePath = `/w3ai/${postId}/${article.vertical_slug}/${titleSlug}`;
    const articleUrl = lang !== "en"
      ? `${SITE_URL}/${lang}${articlePath}`
      : `${SITE_URL}${articlePath}`;

    const html = generateMetaHtml({
      title: decodeHtmlEntities(article.title),
      description: decodeHtmlEntities(excerpt),
      image: article.image_url || DEFAULT_IMAGE,
      url: articleUrl,
      type: "article",
      author: article.author,
      publishedTime: article.published_at,
      section: formatVerticalName(article.vertical_slug),
      lang,
      articlePath,
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
  lang: string;
  author?: string;
  publishedTime?: string;
  section?: string;
  articlePath?: string;
}): string {
  const ogLocale = langToOgLocale(meta.lang);

  const articleMeta =
    meta.type === "article"
      ? `
    <meta property="article:published_time" content="${meta.publishedTime || ""}" />
    ${meta.author ? `<meta property="article:author" content="${meta.author}" />` : ""}
    ${meta.section ? `<meta property="article:section" content="${meta.section}" />` : ""}
  `
      : "";

  // Generate hreflang alternate links
  const basePath = meta.articlePath || "";
  const hreflangLinks = basePath
    ? SUPPORTED_LANGS.map((l) => {
        const href = l === "en"
          ? `${SITE_URL}${basePath}`
          : `${SITE_URL}/${l}${basePath}`;
        return `  <link rel="alternate" hreflang="${l}" href="${href}" />`;
      }).join("\n") + `\n  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${basePath}" />`
    : "";

  return `<!DOCTYPE html>
<html lang="${meta.lang}">
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
  <meta property="og:locale" content="${ogLocale}" />

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
${hreflangLinks}
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
