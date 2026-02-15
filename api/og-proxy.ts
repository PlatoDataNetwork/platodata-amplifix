// Vercel Serverless Function that proxies to Supabase og-meta and returns correct Content-Type
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const postId = url.searchParams.get('postId');

  const supabaseUrl = `https://tmmerifhwscgicmncndl.supabase.co/functions/v1/og-meta${postId ? `?postId=${postId}` : ''}`;

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
