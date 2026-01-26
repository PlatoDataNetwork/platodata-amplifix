-- Add author and source link fields to rss_feeds table
ALTER TABLE public.rss_feeds
ADD COLUMN IF NOT EXISTS default_author text,
ADD COLUMN IF NOT EXISTS source_link_text text,
ADD COLUMN IF NOT EXISTS source_link_url text;