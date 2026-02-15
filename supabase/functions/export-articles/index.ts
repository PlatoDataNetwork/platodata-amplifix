import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
  const validApiKey = Deno.env.get('PLATOAI_KEY') || Deno.env.get('ARTICLES_API_KEY')
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
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(url.searchParams.get('page_size') || '1000'), 2000)
    const countOnly = url.searchParams.get('count_only') === 'true'

    // Count total first
    const { count: totalCount, error: countError } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('vertical_slug', vertical)

    if (countError) throw countError

    if (countOnly) {
      return new Response(JSON.stringify({
        vertical,
        total: totalCount,
        suggested_pages: Math.ceil((totalCount || 0) / pageSize),
        page_size: pageSize,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const offset = (page - 1) * pageSize
    const totalPages = Math.ceil((totalCount || 0) / pageSize)

    // Fetch one page of articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('vertical_slug', vertical)
      .order('published_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw error

    console.log(`Page ${page}/${totalPages}: fetched ${articles?.length || 0} articles (offset ${offset})`)

    const result: any = { articles: articles || [] }

    // Fetch translations for this page's articles
    if (includeTranslations && articles && articles.length > 0) {
      const articleIds = articles.map(a => a.id)
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

    // Fetch tags for this page's articles
    if (includeTags && articles && articles.length > 0) {
      const articleIds = articles.map(a => a.id)
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
      page,
      page_size: pageSize,
      total_pages: totalPages,
      total_articles: totalCount,
      articles_in_page: articles?.length || 0,
      exported_at: new Date().toISOString(),
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="export-${vertical}-page${page}.json"`,
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
