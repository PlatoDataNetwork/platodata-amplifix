import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

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

    const payload = await req.json()
    const { articles = [], translations = [], tags = [], article_tags = [] } = payload
    const stats = { articles: 0, tags: 0, translations: 0, article_tags: 0, errors: [] as string[] }

    // 1. Upsert tags first (by slug)
    if (tags.length > 0) {
      for (let i = 0; i < tags.length; i += 500) {
        const batch = tags.slice(i, i + 500)
        const { error } = await supabase
          .from('tags')
          .upsert(batch, { onConflict: 'id' })
        if (error) stats.errors.push(`tags batch ${i}: ${error.message}`)
        else stats.tags += batch.length
      }
    }

    // 2. Upsert articles (by id)
    if (articles.length > 0) {
      for (let i = 0; i < articles.length; i += 500) {
        const batch = articles.slice(i, i + 500)
        const { error } = await supabase
          .from('articles')
          .upsert(batch, { onConflict: 'id' })
        if (error) stats.errors.push(`articles batch ${i}: ${error.message}`)
        else stats.articles += batch.length
      }
    }

    // 3. Upsert translations
    if (translations.length > 0) {
      for (let i = 0; i < translations.length; i += 500) {
        const batch = translations.slice(i, i + 500)
        const { error } = await supabase
          .from('article_translations')
          .upsert(batch, { onConflict: 'id' })
        if (error) stats.errors.push(`translations batch ${i}: ${error.message}`)
        else stats.translations += batch.length
      }
    }

    // 4. Upsert article_tags
    if (article_tags.length > 0) {
      for (let i = 0; i < article_tags.length; i += 500) {
        const batch = article_tags.slice(i, i + 500)
        const { error } = await supabase
          .from('article_tags')
          .upsert(batch, { onConflict: 'article_id,tag_id' })
        if (error) stats.errors.push(`article_tags batch ${i}: ${error.message}`)
        else stats.article_tags += batch.length
      }
    }

    console.log('Import complete:', stats)

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Import error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
