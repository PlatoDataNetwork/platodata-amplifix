-- Add max_articles_per_sync column to rss_feeds table
ALTER TABLE public.rss_feeds
ADD COLUMN max_articles_per_sync integer NOT NULL DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN public.rss_feeds.max_articles_per_sync IS 'Maximum number of articles to import per sync. 0 means unlimited.';