import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper to check allowed origins
const allowedOrigins = [
  'https://dashboard.platodata.io',
  'https://ai.platodata.io'
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  };
};

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Validate API key
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
  const validApiKey = Deno.env.get('PLATOAI_KEY')

  if (!apiKey || apiKey !== validApiKey) {
    console.error('Unauthorized: Invalid or missing API key')
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Invalid or missing API key' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const url = new URL(req.url)
    const vertical = url.searchParams.get('vertical')
    const category = url.searchParams.get('category')
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam !== null ? parseInt(limitParam) : 100
    const includeTranslations = url.searchParams.get('include_translations') === 'true'
    
    // Cursor-based pagination parameters
    const cursorPublishedAt = url.searchParams.get('cursor_published_at')
    const cursorId = url.searchParams.get('cursor_id')
    
    // Legacy offset parameter (for backward compatibility)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    console.log(`Fetching articles - vertical: ${vertical}, category: ${category}, limit: ${limit}, cursor_published_at: ${cursorPublishedAt}, cursor_id: ${cursorId}, includeTranslations: ${includeTranslations}`)

    // Build the query
    let query = supabase
      .from('articles')
      .select('id, post_id, title, excerpt, content, author, published_at, read_time, category, vertical_slug, image_url, external_url, metadata, created_at, updated_at', { count: 'exact' })
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })

    // Apply vertical filter if provided
    if (vertical) {
      query = query.eq('vertical_slug', vertical)
    }

    // Apply category filter if provided
    if (category) {
      query = query.eq('category', category)
    }

    // Cursor-based pagination (preferred - fast at any depth)
    if (cursorPublishedAt && cursorId) {
      // Get articles older than cursor OR same timestamp with smaller ID
      query = query.or(`published_at.lt.${cursorPublishedAt},and(published_at.eq.${cursorPublishedAt},id.lt.${cursorId})`)
    } else if (offset > 0) {
      // Legacy offset-based pagination (slow for large offsets, kept for backward compatibility)
      query = query.range(offset, offset + limit - 1)
    }

    // Apply limit
    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data: articles, error: articlesError, count } = await query

    if (articlesError) {
      console.error('Error fetching articles:', articlesError)
      return new Response(
        JSON.stringify({ success: false, error: articlesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let responseData = articles

    // If translations are requested, fetch them
    if (includeTranslations && articles && articles.length > 0) {
      const articleIds = articles.map(a => a.id)
      
      const { data: translations, error: translationsError } = await supabase
        .from('article_translations')
        .select('article_id, language_code, translated_title, translated_excerpt, translated_content')
        .in('article_id', articleIds)

      if (translationsError) {
        console.error('Error fetching translations:', translationsError)
      } else if (translations) {
        // Merge translations with articles
        responseData = articles.map(article => ({
          ...article,
          translations: translations.filter(t => t.article_id === article.id)
        }))
      }
    }

    // Build next_cursor from last article
    let nextCursor = null
    if (articles && articles.length > 0 && articles.length === limit) {
      const lastArticle = articles[articles.length - 1]
      nextCursor = {
        published_at: lastArticle.published_at,
        id: lastArticle.id
      }
    }

    console.log(`Successfully fetched ${articles?.length || 0} articles out of ${count} total`)

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        pagination: {
          limit,
          offset: cursorPublishedAt ? undefined : offset,
          total: count || 0,
          next_cursor: nextCursor
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
