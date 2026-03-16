// Vercel Serverless Function that proxies to Supabase og-meta and returns correct Content-Type
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const postId = url.searchParams.get('postId');
  const lang = url.searchParams.get('lang');

  const params = new URLSearchParams();
  if (postId) params.set('postId', postId);
  if (lang) params.set('lang', lang);

  const qs = params.toString();
  const supabaseUrl = `https://tmmerifhwscgicmncndl.supabase.co/functions/v1/og-meta${qs ? `?${qs}` : ''}`;

  const response = await fetch(supabaseUrl, {
    method: request.method,
    headers: {
      'User-Agent': request.headers.get('user-agent') || '',
      'Accept': 'text/html',
    },
  });

  const html = await response.text();

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
