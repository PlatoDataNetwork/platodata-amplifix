import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import http from 'http';

// GTranslate CA certificate
const gtranslateCaCert = `-----BEGIN CERTIFICATE-----
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

// GTranslate server pool
const servers = ['van', 'kars', 'sis', 'dvin', 'ani', 'evn', 'vagh', 'step', 'sis', 'tigr', 'ani', 'van'];

// Main language
const mainLang = 'en';

// Supported languages
const supportedLangs = [
  'en', 'ar', 'bg', 'zh-cn', 'zh-tw', 'hr', 'cs', 'da', 'nl', 'fi', 'fr', 'de', 'el', 'hi', 'it', 'ja', 'ko', 'no', 'pl', 'pt', 'ro', 'ru', 'es', 'sv', 'ca', 'tl', 'iw', 'id', 'lv', 'lt', 'sr', 'sk', 'sl', 'uk', 'vi', 'sq', 'et', 'gl', 'hu', 'mt', 'th', 'tr', 'fa', 'af', 'ms', 'sw', 'ga', 'cy', 'be', 'is', 'mk', 'yi', 'hy', 'az', 'eu', 'ka', 'ht', 'ur', 'bn', 'bs', 'ceb', 'eo', 'gu', 'ha', 'hmn', 'ig', 'jw', 'kn', 'km', 'lo', 'la', 'mi', 'mr', 'mn', 'ne', 'pa', 'so', 'ta', 'te', 'yo', 'zu', 'my', 'ny', 'kk', 'mg', 'ml', 'si', 'st', 'su', 'tg', 'uz', 'am', 'co', 'haw', 'ku', 'ky', 'lb', 'ps', 'sm', 'gd', 'sn', 'sd', 'fy', 'xh'
];

// Get server based on hostname
function getServer(hostname: string): string {
  const cleanHost = hostname.replace(/^www\./, '');
  let hash = 0;
  for (let i = 0; i < cleanHost.length; i++) {
    hash = ((hash << 5) - hash + cleanHost.charCodeAt(i)) | 0;
  }
  const serverId = Math.abs(hash) % servers.length;
  return servers[serverId];
}

// Create HTTPS agent with custom CA
const httpsAgent = new https.Agent({
  ca: gtranslateCaCert,
  rejectUnauthorized: true
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { glang, gurl = '' } = req.query;
    const langCode = Array.isArray(glang) ? glang[0] : glang;
    const urlPath = Array.isArray(gurl) ? gurl[0] : gurl;

    console.log(`GTranslate proxy request: lang=${langCode}, url=${urlPath}`);

    if (!langCode) {
      return res.status(400).send('Missing language parameter');
    }

    // Validate language code
    if (!supportedLangs.includes(langCode.toLowerCase())) {
      return res.status(400).send('Invalid language code');
    }

    // If main language, redirect to original URL
    if (langCode === mainLang) {
      const redirectUrl = '/' + (urlPath || '').replace(/^\/+/, '');
      return res.redirect(301, redirectUrl);
    }

    // Get origin from request headers
    const origin = req.headers['x-forwarded-host'] as string || req.headers.host || 'platodata.io';
    
    // Pick server based on hostname
    const server = getServer(origin);
    
    // Build the page URL
    let pageUrl = urlPath ? '/' + urlPath : '/';
    
    // URL encode path segments
    if (urlPath) {
      const segments = pageUrl.split('/');
      const encodedSegments = segments.map(segment => 
        segment ? encodeURIComponent(decodeURIComponent(segment)) : ''
      );
      pageUrl = encodedSegments.join('/');
    }

    // Get additional query params (exclude glang and gurl)
    const additionalParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'glang' && key !== 'gurl') {
        const val = Array.isArray(value) ? value[0] : value;
        if (val) additionalParams.set(key, val);
      }
    });
    
    if (additionalParams.toString()) {
      pageUrl += '?' + additionalParams.toString();
    }

    const proxyHost = `${server}.tdn.gtranslate.net`;
    const proxyPath = pageUrl;

    console.log(`Proxying to: https://${proxyHost}${proxyPath}`);

    // Forward headers
    const forwardHeaders: Record<string, string> = {
      'X-GT-Lang': langCode,
      'X-GT-Orig': `https://${origin}`,
      'Host': proxyHost,
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5',
    };

    // Make the proxy request
    const proxyResponse = await new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
      const proxyReq = https.request({
        hostname: proxyHost,
        port: 443,
        path: proxyPath,
        method: req.method || 'GET',
        headers: forwardHeaders,
        agent: httpsAgent
      }, (proxyRes) => {
        let body = '';
        proxyRes.on('data', (chunk) => { body += chunk; });
        proxyRes.on('end', () => {
          resolve({
            statusCode: proxyRes.statusCode || 500,
            headers: proxyRes.headers,
            body
          });
        });
      });

      proxyReq.on('error', reject);
      proxyReq.setTimeout(30000, () => {
        proxyReq.destroy();
        reject(new Error('Request timeout'));
      });
      proxyReq.end();
    });

    console.log(`Proxy response status: ${proxyResponse.statusCode}`);

    // Set response headers
    const contentType = proxyResponse.headers['content-type'];
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Forward cache headers if present
    if (proxyResponse.headers['cache-control']) {
      res.setHeader('Cache-Control', proxyResponse.headers['cache-control']);
    }

    return res.status(proxyResponse.statusCode).send(proxyResponse.body);

  } catch (error) {
    console.error('GTranslate proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).send(`Proxy error: ${errorMessage}`);
  }
}
