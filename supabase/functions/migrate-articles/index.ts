import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

const SOURCE_BASE = 'https://rfkdcmvzvxcsoecoeddi.supabase.co/functions/v1/export-articles'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const vertical = url.searchParams.get('vertical') || 'artificial-intelligence'
    const pageSize = parseInt(url.searchParams.get('page_size') || '100')
    const startPage = parseInt(url.searchParams.get('start_page') || '1')
    const maxPages = parseInt(url.searchParams.get('max_pages') || '5')
    const autoChain = url.searchParams.get('auto_chain') !== 'false'

    // Step 1: Get count from source
    const countRes = await fetch(`${SOURCE_BASE}?vertical=${vertical}&count_only=true`)
    if (!countRes.ok) throw new Error(`Source count failed: ${countRes.status}`)
    const countData = await countRes.json()
    const totalPages = Math.ceil((countData.total || 0) / pageSize)
    const endPage = Math.min(startPage + maxPages - 1, totalPages)

    console.log(`Migration: ${countData.total} articles, ${totalPages} total pages, processing pages ${startPage}-${endPage}`)

    const results: any[] = []

    for (let page = startPage; page <= endPage; page++) {
      console.log(`Fetching page ${page}/${totalPages}...`)
      
      const exportRes = await fetch(`${SOURCE_BASE}?vertical=${vertical}&page=${page}&page_size=${pageSize}`)
      if (!exportRes.ok) {
        results.push({ page, error: `fetch failed: ${exportRes.status}` })
        continue
      }

      const data = await exportRes.json()
      const { articles = [], translations = [], tags = [], article_tags = [] } = data
      const stats = { articles: 0, tags: 0, translations: 0, article_tags: 0, errors: [] as string[] }

      // Upsert tags
      if (tags.length > 0) {
        for (let i = 0; i < tags.length; i += 500) {
          const batch = tags.slice(i, i + 500)
          const { error } = await supabase.from('tags').upsert(batch, { onConflict: 'id' })
          if (error) stats.errors.push(`tags: ${error.message}`)
          else stats.tags += batch.length
        }
      }

      // Upsert articles
      if (articles.length > 0) {
        for (let i = 0; i < articles.length; i += 500) {
          const batch = articles.slice(i, i + 500)
          const { error } = await supabase.from('articles').upsert(batch, { onConflict: 'id' })
          if (error) stats.errors.push(`articles: ${error.message}`)
          else stats.articles += batch.length
        }
      }

      // Upsert translations
      if (translations.length > 0) {
        for (let i = 0; i < translations.length; i += 500) {
          const batch = translations.slice(i, i + 500)
          const { error } = await supabase.from('article_translations').upsert(batch, { onConflict: 'id' })
          if (error) stats.errors.push(`translations: ${error.message}`)
          else stats.translations += batch.length
        }
      }

      // Upsert article_tags
      if (article_tags.length > 0) {
        for (let i = 0; i < article_tags.length; i += 500) {
          const batch = article_tags.slice(i, i + 500)
          const { error } = await supabase.from('article_tags').upsert(batch, { onConflict: 'article_id,tag_id' })
          if (error) stats.errors.push(`article_tags: ${error.message}`)
          else stats.article_tags += batch.length
        }
      }

      results.push({ page, stats })
      console.log(`Page ${page} done:`, stats)
    }

    const nextPage = endPage < totalPages ? endPage + 1 : null

    // Auto-chain: fire-and-forget the next batch
    if (nextPage && autoChain) {
      const selfUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/migrate-articles?vertical=${vertical}&page_size=${pageSize}&start_page=${nextPage}&max_pages=${maxPages}&auto_chain=true`
      console.log(`Auto-chaining next batch starting at page ${nextPage}...`)
      fetch(selfUrl).catch(err => console.error('Chain fetch error:', err))
    }

    return new Response(JSON.stringify({
      success: true,
      vertical,
      total_source_articles: countData.total,
      pages_processed: results.length,
      next_start_page: nextPage,
      total_pages: totalPages,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Migration error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
