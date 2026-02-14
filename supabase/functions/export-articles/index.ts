import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Validate API key
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
  const validApiKey = Deno.env.get('PLATOAI_KEY')
  if (!apiKey || apiKey !== validApiKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const vertical = url.searchParams.get('vertical') || 'artificial-intelligence'
    const includeTags = url.searchParams.get('include_tags') !== 'false'
    const includeTranslations = url.searchParams.get('include_translations') !== 'false'

    // Paginate articles (1000 per batch)
    const allArticles: any[] = []
    let offset = 0
    const batchSize = 1000
    while (true) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('vertical_slug', vertical)
        .order('published_at', { ascending: false })
        .range(offset, offset + batchSize - 1)

      if (error) throw error
      if (!data || data.length === 0) break
      allArticles.push(...data)
      if (data.length < batchSize) break
      offset += batchSize
    }

    console.log(`Exported ${allArticles.length} articles for vertical: ${vertical}`)

    const result: any = { articles: allArticles }

    // Fetch translations
    if (includeTranslations && allArticles.length > 0) {
      const articleIds = allArticles.map(a => a.id)
      const allTranslations: any[] = []
      for (let i = 0; i < articleIds.length; i += 500) {
        const batch = articleIds.slice(i, i + 500)
        const { data } = await supabase
          .from('article_translations')
          .select('*')
          .in('article_id', batch)
        if (data) allTranslations.push(...data)
      }
      result.translations = allTranslations
    }

    // Fetch tags
    if (includeTags && allArticles.length > 0) {
      const articleIds = allArticles.map(a => a.id)
      const allArticleTags: any[] = []
      for (let i = 0; i < articleIds.length; i += 500) {
        const batch = articleIds.slice(i, i + 500)
        const { data } = await supabase
          .from('article_tags')
          .select('*')
          .in('article_id', batch)
        if (data) allArticleTags.push(...data)
      }
      result.article_tags = allArticleTags

      // Fetch the actual tag records
      const tagIds = [...new Set(allArticleTags.map(at => at.tag_id))]
      if (tagIds.length > 0) {
        const { data: tags } = await supabase
          .from('tags')
          .select('*')
          .in('id', tagIds)
        result.tags = tags || []
      }
    }

    result.meta = {
      vertical,
      total_articles: allArticles.length,
      total_translations: result.translations?.length || 0,
      total_tags: result.tags?.length || 0,
      total_article_tags: result.article_tags?.length || 0,
      exported_at: new Date().toISOString(),
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="export-${vertical}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
