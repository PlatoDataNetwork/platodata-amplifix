-- Add default_image_url column to rss_feeds table
ALTER TABLE public.rss_feeds 
ADD COLUMN default_image_url text DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.rss_feeds.default_image_url IS 'Default featured image URL to use for all articles imported from this feed instead of extracting from RSS';