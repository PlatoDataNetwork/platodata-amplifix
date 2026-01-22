import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GTranslate server pool - same as in config.php
const servers = ['van', 'kars', 'sis', 'dvin', 'ani', 'evn', 'vagh', 'step', 'sis', 'tigr', 'ani', 'van'];

// Main language of the website
const mainLang = 'en';

// Supported language codes from GTranslate
const supportedLangs = [
  'en', 'ar', 'bg', 'zh-cn', 'zh-tw', 'hr', 'cs', 'da', 'nl', 'fi', 'fr', 'de', 'el', 'hi', 'it', 'ja', 'ko', 'no', 'pl', 'pt', 'ro', 'ru', 'es', 'sv', 'ca', 'tl', 'iw', 'id', 'lv', 'lt', 'sr', 'sk', 'sl', 'uk', 'vi', 'sq', 'et', 'gl', 'hu', 'mt', 'th', 'tr', 'fa', 'af', 'ms', 'sw', 'ga', 'cy', 'be', 'is', 'mk', 'yi', 'hy', 'az', 'eu', 'ka', 'ht', 'ur', 'bn', 'bs', 'ceb', 'eo', 'gu', 'ha', 'hmn', 'ig', 'jw', 'kn', 'km', 'lo', 'la', 'mi', 'mr', 'mn', 'ne', 'pa', 'so', 'ta', 'te', 'yo', 'zu', 'my', 'ny', 'kk', 'mg', 'ml', 'si', 'st', 'su', 'tg', 'uz', 'am', 'co', 'haw', 'ku', 'ky', 'lb', 'ps', 'sm', 'gd', 'sn', 'sd', 'fy', 'xh'
];

// Get server based on hostname (same algorithm as PHP)
function getServer(hostname: string): string {
  const cleanHost = hostname.replace(/^www\./, '');
  // Simple hash using MD5-like calculation
  const md5Like = Array.from(cleanHost).reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  const serverId = Math.abs(md5Like) % servers.length;
  return servers[serverId];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const glang = url.searchParams.get('glang');
    const gurl = url.searchParams.get('gurl') || '';

    console.log(`GTranslate proxy request: lang=${glang}, url=${gurl}`);

    if (!glang) {
      return new Response('Missing language parameter', { status: 400 });
    }

    // Validate language code
    if (!supportedLangs.includes(glang.toLowerCase())) {
      return new Response('Invalid language code', { status: 400 });
    }

    // If main language, redirect to original URL
    if (glang === mainLang) {
      const redirectUrl = '/' + gurl.replace(/^\/+/, '');
      return new Response(null, {
        status: 301,
        headers: { 'Location': redirectUrl }
      });
    }

    // Get origin from request headers or use default
    const origin = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'platodata.io';
    
    // Pick server based on hostname
    const server = getServer(origin);
    
    // Build the page URL - handle empty path for homepage
    let pageUrl = gurl ? '/' + gurl : '/';
    
    // URL encode path segments (but not slashes)
    if (gurl) {
      const segments = pageUrl.split('/');
      const encodedSegments = segments.map(segment => 
        segment ? encodeURIComponent(decodeURIComponent(segment)) : ''
      );
      pageUrl = encodedSegments.join('/');
    }

    // Get additional query params (exclude glang and gurl)
    const additionalParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== 'glang' && key !== 'gurl') {
        additionalParams.set(key, value);
      }
    });
    
    if (additionalParams.toString()) {
      pageUrl += '?' + additionalParams.toString();
    }

    // Build the full proxy URL to GTranslate
    // Use HTTP since Supabase Edge Functions cannot add custom CA certs
    // GTranslate's custom CA certificate is not trusted by default
    const protocol = 'http';
    const proxyUrl = `${protocol}://${server}.tdn.gtranslate.net${pageUrl}`;

    console.log(`Proxying to: ${proxyUrl}`);

    // Forward headers (excluding problematic ones)
    const forwardHeaders = new Headers();
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['host', 'connection', 'x-gt-lang', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
        forwardHeaders.set(key, value);
      }
    });

    // Set required GTranslate headers
    forwardHeaders.set('X-GT-Lang', glang);
    forwardHeaders.set('X-GT-Orig', `${protocol}://${origin}`);
    forwardHeaders.set('Host', `${server}.tdn.gtranslate.net`);

    // Make the proxy request
    const proxyResponse = await fetch(proxyUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    });

    // Get response body
    const responseBody = await proxyResponse.text();

    // Forward response headers
    const responseHeaders = new Headers();
    proxyResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['transfer-encoding', 'content-encoding', 'content-length'].includes(lowerKey)) {
        responseHeaders.set(key, value);
      }
    });

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // Set content type if present
    const contentType = proxyResponse.headers.get('content-type');
    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }

    console.log(`Proxy response status: ${proxyResponse.status}`);

    return new Response(responseBody, {
      status: proxyResponse.status,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('GTranslate proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Proxy error: ${errorMessage}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
