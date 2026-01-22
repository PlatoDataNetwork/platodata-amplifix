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
  let hash = 0;
  for (let i = 0; i < Math.min(cleanHost.length, 5); i++) {
    hash = hash * 16 + parseInt(cleanHost.charCodeAt(i).toString(16), 16);
  }
  // Simple hash using MD5-like calculation
  const md5Like = Array.from(cleanHost).reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  const serverId = Math.abs(md5Like) % servers.length;
  return servers[serverId];
}

// Get CA certificate for SSL verification
const caCert = `-----BEGIN CERTIFICATE-----
MIIDmzCCAoOgAwIBAgIJALjD5B2Tw5WVMA0GCSqGSIb3DQEBCwUAMGQxCzAJBgNV
BAYTAlVTMQswCQYDVQQIDAJDQTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzEXMBUG
A1UECgwOR1RyYW5zbGF0ZSBJbmMxFzAVBgNVBAMMDmd0cmFuc2xhdGUuY29tMB4X
DTE5MDIyMDE2NDcwN1oXDTI5MDIxNzE2NDcwN1owZDELMAkGA1UEBhMCVVMxCzAJ
BgNVBAgMAkNBMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMRcwFQYDVQQKDA5HVHJh
bnNsYXRlIEluYzEXMBUGA1UEAwwOZ3RyYW5zbGF0ZS5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQC3wWCPu05M9T9rpJR8rY/RYPEkyL5EmGUcirMe
EJncOQnv0cKEU722xBuLBN2RPT/+pM2nVcMKbp/aFbJ5PX8BR6ZXKaGDQMPHdASV
nM20yt1RJc+qNHDUL1vDvIlNfV+ux3by+k/dNNCXYj2BBzVbhqoJefHNtry3QnQ3
AJ5hf09PHKtLAMS6PeaVmHn6XfCsKK2iQ5hD6qN85C8x7GiltEJD0Np0zM9nTim2
ilQfpvF5JaDM0lf9vNJDseQ7JOlBM/WcQ3BtgbswFvq3kIMcIGTjqsw/dtNcUUpV
PsGwz797bq31aFug0J0a9DMYMgbErPlC0r6JkazU3hdBvcF7AgMBAAGjUDBOMB0G
A1UdDgQWBBTHGSln6Hs9Rk7iLECUbjMcB99b4jAfBgNVHSMEGDAWgBTHGSln6Hs9
Rk7iLECUbjMcB99b4jAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBZ
RWN7otrYojEehmjd3ybFrU95R9W4uLWV/LBUlW+sARAmunmQve0hARG8nOP0Tg4m
5I0v1vxY1wVnYV6hi1+gba+ynBnNt7XkebqXC1Qq99WdQfi2M/a1clIbFZUJhWec
Wv5WqXaafW102b/z7syZkRtrtZ6YhGSMtwd071C9KQbE025wqDVM2TioL6viSpZG
YDYks7e7ogS4fUAorODAxT0FZ1GZM0HaZ/XQG33SpoG5saHHxflMqTh4dLcnh5KN
W++ZZCwEYKrLi5slHjlyciZU7EWJNLWOnqNMZUxLX2yZ/hh9idzazEzm9IoQYrGP
dAifs/vxi/FmcAllKc1Y
-----END CERTIFICATE-----`;

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
    
    // Build the page URL
    let pageUrl = '/' + gurl;
    
    // URL encode path segments
    const segments = pageUrl.split('/');
    const encodedSegments = segments.map(segment => encodeURIComponent(decodeURIComponent(segment)));
    pageUrl = encodedSegments.join('/');

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
    const protocol = 'https';
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
