

# Transfer "artificial-intelligence" Articles Between Supabase Projects

## Overview
Move all 386 articles with `vertical_slug = 'artificial-intelligence'` from this project's Supabase to another Lovable project's Supabase.

## Approach: Export Edge Function + Import Edge Function

### Step 1: Create an Export Edge Function (this project)
Build a new edge function `export-articles` that:
- Accepts a `vertical_slug` query parameter
- Fetches all matching articles from the database (handling the 1000-row Supabase limit by paginating)
- Returns them as a JSON download
- Secured with the existing `PLATOAI_KEY` API key

### Step 2: Create an Import Edge Function (other project)
In the **other** Lovable project, create an `import-articles` edge function that:
- Accepts a JSON payload of articles via POST
- Inserts them into the target `articles` table
- Handles conflicts (skips duplicates based on `post_id` or `title`)
- Uses the service role key to bypass RLS for insertion

### Step 3: Admin UI Transfer Button (this project)
Add a simple "Export Articles" button in the admin area that:
- Lets you select a vertical slug
- Calls the export edge function
- Downloads the JSON file

You can then upload/paste this JSON into the other project's import endpoint.

## Alternative: Direct Transfer (Simpler)
Instead of two edge functions, we build a **single export edge function** on this project that outputs a downloadable JSON file. You then use the other project's existing `articles-api` or a simple SQL import in the other project's Supabase SQL Editor.

## What Gets Transferred
- All article fields: `post_id`, `title`, `excerpt`, `content`, `author`, `published_at`, `read_time`, `category`, `vertical_slug`, `image_url`, `external_url`, `metadata`
- Article translations (optional, from `article_translations` table)
- Article tags (optional, from `article_tags` table)

## Technical Details

### Export Edge Function (`export-articles/index.ts`)
- Endpoint: `GET /export-articles?vertical=artificial-intelligence`
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass row limits
- Paginates through all 386 articles in batches of 1000
- Returns JSON array with all article data
- Optionally includes translations and tags

### Data Format
```text
{
  "articles": [ ... ],
  "translations": [ ... ],
  "tags": [ ... ],
  "article_tags": [ ... ]
}
```

### On the Other Project
- Ensure the `articles` table schema matches (same columns)
- Run a SQL INSERT or use an import edge function to load the JSON data
- The `post_id` values can be preserved or re-generated depending on your preference

## Implementation Steps
1. Create `supabase/functions/export-articles/index.ts` on this project
2. Deploy and test the export endpoint
3. Download the JSON for `artificial-intelligence` articles
4. On the other Lovable project, import via SQL Editor or a dedicated import function

