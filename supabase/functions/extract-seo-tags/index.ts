import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { article_ids } = await req.json()
    if (!article_ids || !Array.isArray(article_ids) || article_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'article_ids array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch articles
    const { data: articles, error: fetchErr } = await supabase
      .from('articles')
      .select('id, title, content, excerpt')
      .in('id', article_ids)
    if (fetchErr) throw fetchErr

    // Fetch all existing tags for reuse
    const { data: existingTags } = await supabase.from('tags').select('id, name, slug')
    const tagMap = new Map((existingTags || []).map(t => [t.slug, t]))

    const results: { article_id: string; tags_added: string[]; error?: string }[] = []

    for (const article of (articles || [])) {
      try {
        // Strip HTML for cleaner AI input
        const plainContent = (article.content || article.excerpt || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000)

        if (!plainContent && !article.title) {
          results.push({ article_id: article.id, tags_added: [], error: 'No content' })
          continue
        }

        // Call Lovable AI to extract keywords
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              {
                role: 'system',
                content: `You are an SEO keyword extraction expert. Extract 5-10 high-value SEO keywords/phrases from the given article. Focus on:
- Primary topic keywords with search volume potential
- Long-tail keywords relevant to the content
- Industry-specific terms
- Named entities (companies, technologies, people)
Return ONLY a JSON array of lowercase keyword strings. No explanations.`
              },
              {
                role: 'user',
                content: `Title: ${article.title}\n\nContent: ${plainContent}`
              }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'extract_keywords',
                description: 'Extract SEO keywords from article content',
                parameters: {
                  type: 'object',
                  properties: {
                    keywords: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Array of 5-10 lowercase SEO keywords/phrases'
                    }
                  },
                  required: ['keywords'],
                  additionalProperties: false
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'extract_keywords' } }
          }),
        })

        if (!aiResponse.ok) {
          const status = aiResponse.status
          const errText = await aiResponse.text()
          if (status === 429) {
            results.push({ article_id: article.id, tags_added: [], error: 'Rate limited, try again later' })
            continue
          }
          if (status === 402) {
            results.push({ article_id: article.id, tags_added: [], error: 'Credits exhausted' })
            continue
          }
          results.push({ article_id: article.id, tags_added: [], error: `AI error: ${status}` })
          console.error('AI error:', status, errText)
          continue
        }

        const aiData = await aiResponse.json()
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0]
        if (!toolCall) {
          results.push({ article_id: article.id, tags_added: [], error: 'No AI response' })
          continue
        }

        const { keywords } = JSON.parse(toolCall.function.arguments)
        if (!keywords || !Array.isArray(keywords)) {
          results.push({ article_id: article.id, tags_added: [], error: 'Invalid AI output' })
          continue
        }

        const addedTags: string[] = []

        for (const keyword of keywords.slice(0, 10)) {
          const name = keyword.trim().toLowerCase()
          if (!name || name.length < 2) continue
          const slug = name.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          if (!slug) continue

          let tagId: string
          const existing = tagMap.get(slug)
          if (existing) {
            tagId = existing.id
          } else {
            // Create new tag
            const { data: newTag, error: tagErr } = await supabase
              .from('tags')
              .upsert({ name, slug }, { onConflict: 'slug' })
              .select('id')
              .single()
            if (tagErr || !newTag) {
              console.error('Tag upsert error:', tagErr)
              continue
            }
            tagId = newTag.id
            tagMap.set(slug, { id: tagId, name, slug })
          }

          // Link tag to article (ignore if already linked)
          const { error: linkErr } = await supabase
            .from('article_tags')
            .upsert({ article_id: article.id, tag_id: tagId }, { onConflict: 'article_id,tag_id' })
          if (!linkErr) {
            addedTags.push(name)
          }
        }

        results.push({ article_id: article.id, tags_added: addedTags })

        // Small delay between articles to avoid rate limits
        if (articles && articles.indexOf(article) < articles.length - 1) {
          await new Promise(r => setTimeout(r, 500))
        }
      } catch (err) {
        results.push({ article_id: article.id, tags_added: [], error: (err as Error).message })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('extract-seo-tags error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
