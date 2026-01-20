import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.platodata.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Validate API key
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
  const validApiKey = Deno.env.get('ARTICLES_API_KEY')

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
    const limit = limitParam !== null ? parseInt(limitParam) : 50
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const includeTranslations = url.searchParams.get('include_translations') === 'true'

    console.log(`Fetching articles - vertical: ${vertical}, category: ${category}, limit: ${limit}, offset: ${offset}, includeTranslations: ${includeTranslations}`)

    // Build the query
    let query = supabase
      .from('articles')
      .select('id, post_id, title, excerpt, content, author, published_at, read_time, category, vertical_slug, image_url, external_url, metadata, created_at, updated_at', { count: 'exact' })
      .order('published_at', { ascending: false })

    // Apply range only if limit > 0 (limit=0 means fetch all)
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    // Apply vertical filter if provided
    if (vertical) {
      query = query.eq('vertical_slug', vertical)
    }

    // Apply category filter if provided
    if (category) {
      query = query.eq('category', category)
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

    console.log(`Successfully fetched ${articles?.length || 0} articles out of ${count} total`)

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        pagination: {
          limit,
          offset,
          total: count || 0
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
