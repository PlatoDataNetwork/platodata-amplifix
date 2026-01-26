import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RssFeed {
  id: string;
  name: string;
  feed_url: string;
  vertical_slug: string;
  status: string;
  import_mode: string;
  publish_status: string;
  default_image_url: string | null;
  check_duplicate_title: boolean;
  check_duplicate_link: boolean;
  max_articles_per_sync: number;
  strip_images: boolean;
  default_author: string | null;
  source_link_text: string | null;
  source_link_url: string | null;
}

interface FeedItem {
  title: string;
  link: string;
  description: string;
  content: string;
  pubDate: string;
  guid: string;
  author: string;
  imageUrl: string | null;
  postId: number | null;
}

// Parse RSS/Atom feed XML
function parseFeed(xmlText: string): FeedItem[] {
  const items: FeedItem[] = [];
  
  // Check if it's an Atom feed
  const isAtom = xmlText.includes("<feed") && xmlText.includes("xmlns=\"http://www.w3.org/2005/Atom\"");
  
  if (isAtom) {
    // Parse Atom feed
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    let match;
    
    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entry = match[1];
      
      const title = extractTagContent(entry, "title") || "";
      const link = extractAtomLink(entry) || "";
      const content = extractTagContent(entry, "content") || extractTagContent(entry, "summary") || "";
      const summary = extractTagContent(entry, "summary") || "";
      const pubDate = extractTagContent(entry, "published") || extractTagContent(entry, "updated") || "";
      const guid = extractTagContent(entry, "id") || link;
      const author = extractAtomAuthor(entry) || "";
      const imageUrl = extractImageFromContent(content) || extractMediaContent(entry);
      
      const postId = extractPostId(entry, guid, link);
      
      items.push({
        title: cleanHtml(title),
        link,
        description: cleanHtml(summary),
        content,
        pubDate,
        guid,
        author: cleanHtml(author),
        imageUrl,
        postId,
      });
    }
  } else {
    // Parse RSS feed
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const item = match[1];
      
      const title = extractTagContent(item, "title") || "";
      const link = extractTagContent(item, "link") || "";
      const description = extractTagContent(item, "description") || "";
      const content = extractTagContent(item, "content:encoded") || extractTagContent(item, "content") || description;
      const pubDate = extractTagContent(item, "pubDate") || extractTagContent(item, "dc:date") || "";
      const guid = extractTagContent(item, "guid") || link;
      const author = extractTagContent(item, "dc:creator") || extractTagContent(item, "author") || "";
      const imageUrl = extractMediaContent(item) || extractEnclosure(item) || extractImageFromContent(content);
      
      const postId = extractPostId(item, guid, link);
      
      items.push({
        title: cleanHtml(title),
        link,
        description: cleanHtml(description),
        content,
        pubDate,
        guid,
        author: cleanHtml(author),
        imageUrl,
        postId,
      });
    }
  }
  
  return items;
}

function extractTagContent(xml: string, tagName: string): string | null {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  
  // Regular content
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractAtomLink(entry: string): string | null {
  // Look for link with rel="alternate" or no rel attribute
  const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  let alternateLink = null;
  let firstLink = null;
  
  while ((match = linkRegex.exec(entry)) !== null) {
    const fullTag = match[0];
    const href = match[1];
    
    if (!firstLink) firstLink = href;
    if (fullTag.includes('rel="alternate"') || !fullTag.includes("rel=")) {
      alternateLink = href;
      break;
    }
  }
  
  return alternateLink || firstLink;
}

function extractAtomAuthor(entry: string): string | null {
  const authorRegex = /<author[^>]*>([\s\S]*?)<\/author>/i;
  const match = entry.match(authorRegex);
  if (match) {
    const nameMatch = match[1].match(/<name[^>]*>([^<]+)<\/name>/i);
    return nameMatch ? nameMatch[1] : null;
  }
  return null;
}

function extractMediaContent(item: string): string | null {
  // media:content
  const mediaRegex = /<media:content[^>]*url=["']([^"']+)["'][^>]*>/i;
  const mediaMatch = item.match(mediaRegex);
  if (mediaMatch) return mediaMatch[1];
  
  // media:thumbnail
  const thumbRegex = /<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/i;
  const thumbMatch = item.match(thumbRegex);
  if (thumbMatch) return thumbMatch[1];
  
  return null;
}

function extractEnclosure(item: string): string | null {
  const enclosureRegex = /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image[^"']*["'][^>]*>/i;
  const match = item.match(enclosureRegex);
  return match ? match[1] : null;
}

function extractImageFromContent(content: string): string | null {
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;
  const match = content.match(imgRegex);
  return match ? match[1] : null;
}

// Extract post_id from various RSS feed formats
function extractPostId(itemXml: string, guid: string, link: string): number | null {
  // 1. WordPress <wp:post_id> tag
  const wpPostIdMatch = itemXml.match(/<wp:post_id[^>]*>(\d+)<\/wp:post_id>/i);
  if (wpPostIdMatch) {
    return parseInt(wpPostIdMatch[1], 10);
  }
  
  // 2. Generic <post_id> or <postId> tag
  const genericPostIdMatch = itemXml.match(/<post[_-]?id[^>]*>(\d+)<\/post[_-]?id>/i);
  if (genericPostIdMatch) {
    return parseInt(genericPostIdMatch[1], 10);
  }
  
  // 3. <id> tag with numeric content (common in some feeds)
  const idTagMatch = itemXml.match(/<id[^>]*>(\d+)<\/id>/i);
  if (idTagMatch) {
    return parseInt(idTagMatch[1], 10);
  }
  
  // 4. Extract from GUID if it contains ?p=123 pattern (WordPress)
  const guidParamMatch = guid.match(/[?&]p=(\d+)/);
  if (guidParamMatch) {
    return parseInt(guidParamMatch[1], 10);
  }
  
  // 5. Extract from GUID if it's just a number
  if (/^\d+$/.test(guid)) {
    return parseInt(guid, 10);
  }
  
  // 6. Extract from link URL patterns like /post/123 or /article/123 or ?p=123
  const linkPatterns = [
    /[?&]p=(\d+)/,                    // WordPress ?p=123
    /\/(?:post|article|news|blog|p)\/(\d+)/i,  // /post/123, /article/123
    /\/(\d+)\/?(?:\?|#|$)/,           // /123/ or /123
    /-(\d+)\/?(?:\?|#|$)/,            // slug-123
  ];
  
  for (const pattern of linkPatterns) {
    const match = link.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// Remove all image tags and figure elements from HTML content
function stripImagesFromContent(html: string): string {
  return html
    // Remove <figure> elements (often wrap images)
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    // Remove <img> tags (self-closing or not)
    .replace(/<img[^>]*\/?>/gi, "")
    // Remove <picture> elements
    .replace(/<picture[^>]*>[\s\S]*?<\/picture>/gi, "")
    // Remove empty paragraphs left behind
    .replace(/<p[^>]*>\s*<\/p>/gi, "")
    .trim();
}

function estimateReadTime(content: string): string {
  const wordCount = cleanHtml(content).split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

// Check if article is a duplicate based on title or link
// deno-lint-ignore no-explicit-any
async function isDuplicate(
  supabase: any,
  item: FeedItem,
  checkTitle: boolean,
  checkLink: boolean
): Promise<boolean> {
  if (!checkTitle && !checkLink) {
    return false;
  }

  // Check by title
  if (checkTitle && item.title) {
    const { data: titleMatch } = await supabase
      .from("articles")
      .select("id")
      .eq("title", item.title)
      .limit(1);
    
    if (titleMatch && titleMatch.length > 0) {
      console.log(`Duplicate found by title: "${item.title}"`);
      return true;
    }
  }

  // Check by link (external_url or in metadata)
  if (checkLink && item.link) {
    // Check external_url field
    const { data: linkMatch } = await supabase
      .from("articles")
      .select("id")
      .eq("external_url", item.link)
      .limit(1);
    
    if (linkMatch && linkMatch.length > 0) {
      console.log(`Duplicate found by external_url: "${item.link}"`);
      return true;
    }

    // Also check metadata->original_url
    const { data: metadataMatch } = await supabase
      .from("articles")
      .select("id")
      .contains("metadata", { original_url: item.link })
      .limit(1);
    
    if (metadataMatch && metadataMatch.length > 0) {
      console.log(`Duplicate found by metadata original_url: "${item.link}"`);
      return true;
    }
  }

  return false;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { feedId } = await req.json();
    
    if (!feedId) {
      return new Response(
        JSON.stringify({ error: "feedId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Starting sync for feed: ${feedId}`);
    
    // Get feed configuration
    const { data: feed, error: feedError } = await supabase
      .from("rss_feeds")
      .select("*")
      .eq("id", feedId)
      .single();
    
    if (feedError || !feed) {
      console.error("Feed not found:", feedError);
      return new Response(
        JSON.stringify({ error: "Feed not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const rssFeed = feed as RssFeed;
    console.log(`Fetching RSS feed: ${rssFeed.feed_url}`);
    console.log(`Duplicate checking - Title: ${rssFeed.check_duplicate_title}, Link: ${rssFeed.check_duplicate_link}`);
    
    // Fetch the RSS feed
    let feedResponse;
    try {
      feedResponse = await fetch(rssFeed.feed_url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PlatoData RSS Syndicator/1.0)",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
      });
    } catch (fetchError: unknown) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("Failed to fetch feed:", fetchError);
      await supabase.from("rss_feeds").update({
        status: "error",
        last_error: `Failed to fetch feed: ${errorMessage}`,
      }).eq("id", feedId);
      
      return new Response(
        JSON.stringify({ error: `Failed to fetch feed: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!feedResponse.ok) {
      const errorMsg = `Feed returned status ${feedResponse.status}`;
      console.error(errorMsg);
      await supabase.from("rss_feeds").update({
        status: "error",
        last_error: errorMsg,
      }).eq("id", feedId);
      
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const xmlText = await feedResponse.text();
    console.log(`Feed fetched, parsing XML (${xmlText.length} bytes)`);
    
    // Parse the feed
    const feedItems = parseFeed(xmlText);
    console.log(`Parsed ${feedItems.length} items from feed`);
    
    if (feedItems.length === 0) {
      await supabase.from("rss_feeds").update({
        last_synced_at: new Date().toISOString(),
        last_error: null,
        status: "active",
      }).eq("id", feedId);
      
      return new Response(
        JSON.stringify({ articlesImported: 0, message: "No items found in feed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get existing synced GUIDs
    const { data: existingLogs } = await supabase
      .from("feed_sync_logs")
      .select("original_guid")
      .eq("feed_id", feedId);
    
    const existingGuids = new Set(existingLogs?.map(log => log.original_guid) || []);
    console.log(`Found ${existingGuids.size} previously synced items`);
    
    // Filter new items (not in sync logs)
    const newItems = feedItems.filter(item => !existingGuids.has(item.guid));
    console.log(`${newItems.length} new items to import (after GUID check)`);
    
    // Apply max articles limit if configured
    const maxArticles = rssFeed.max_articles_per_sync || 0;
    const itemsToProcess = maxArticles > 0 ? newItems.slice(0, maxArticles) : newItems;
    console.log(`Processing ${itemsToProcess.length} items (max limit: ${maxArticles > 0 ? maxArticles : 'unlimited'})`);
    
    let articlesImported = 0;
    let duplicatesSkipped = 0;
    
    for (const item of itemsToProcess) {
      try {
        // Check for duplicates by title/link if enabled
        const isDup = await isDuplicate(
          supabase,
          item,
          rssFeed.check_duplicate_title,
          rssFeed.check_duplicate_link
        );
        
        if (isDup) {
          console.log(`Skipping duplicate article: "${item.title}"`);
          duplicatesSkipped++;
          
          // Still log it so we don't check again
          await supabase.from("feed_sync_logs").insert({
            feed_id: feedId,
            article_id: null,
            original_guid: item.guid,
            original_url: item.link,
          });
          
          continue;
        }
        
        // Prepare article data
        const isExcerptMode = rssFeed.import_mode === "excerpt_with_link";
        const rawContent = isExcerptMode ? item.description : item.content;
        // Strip images from content if enabled (default is true)
        let articleContent = rssFeed.strip_images !== false 
          ? stripImagesFromContent(rawContent || "") 
          : (rawContent || "");
        
        // Append source link at the end of content if configured
        if (rssFeed.source_link_text && rssFeed.source_link_url) {
          const sourceLink = `<p style="margin-top: 1.5em; padding-top: 1em; border-top: 1px solid #eee;"><strong>Source:</strong> <a href="${rssFeed.source_link_url}" target="_blank" rel="noopener noreferrer">${rssFeed.source_link_text}</a></p>`;
          articleContent = articleContent + sourceLink;
        }
        
        const publishDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
        
        // Use default image from feed if set, otherwise null (ignore RSS images)
        const imageUrl = rssFeed.default_image_url || null;
        
        // Use default author from feed if set, otherwise use RSS author
        const articleAuthor = rssFeed.default_author || item.author || null;
        
        // Create article
        const { data: article, error: articleError } = await supabase
          .from("articles")
          .insert({
            title: item.title || "Untitled",
            content: articleContent,
            excerpt: item.description?.substring(0, 300) || null,
            author: articleAuthor,
            published_at: publishDate,
            vertical_slug: rssFeed.vertical_slug,
            image_url: imageUrl,
            external_url: isExcerptMode ? item.link : null,
            read_time: estimateReadTime(articleContent || ""),
            post_id: item.postId,
            metadata: {
              source_feed: rssFeed.name,
              original_url: item.link,
              imported_at: new Date().toISOString(),
              is_draft: rssFeed.publish_status === "draft",
              original_post_id: item.postId,
            },
          })
          .select("id")
          .single();
        
        if (articleError) {
          console.error(`Failed to create article for "${item.title}":`, articleError);
          continue;
        }
        
        // Log the sync
        await supabase.from("feed_sync_logs").insert({
          feed_id: feedId,
          article_id: article.id,
          original_guid: item.guid,
          original_url: item.link,
        });
        
        articlesImported++;
        console.log(`Imported: ${item.title}`);
      } catch (itemError) {
        console.error(`Error processing item "${item.title}":`, itemError);
      }
    }
    
    // Update feed status
    await supabase.from("rss_feeds").update({
      last_synced_at: new Date().toISOString(),
      last_error: null,
      status: "active",
    }).eq("id", feedId);
    
    console.log(`Sync complete. Imported ${articlesImported} articles, skipped ${duplicatesSkipped} duplicates.`);
    
    return new Response(
      JSON.stringify({ 
        articlesImported, 
        duplicatesSkipped,
        totalItems: feedItems.length,
        newItems: newItems.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});