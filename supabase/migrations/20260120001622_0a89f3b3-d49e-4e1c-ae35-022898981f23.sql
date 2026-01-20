-- Add strip_images column to rss_feeds table
ALTER TABLE public.rss_feeds
ADD COLUMN strip_images boolean NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN public.rss_feeds.strip_images IS 'Whether to strip images from imported article content. Default is true.';