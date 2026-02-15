-- Add strip_inline_styles column to rss_feeds table
ALTER TABLE public.rss_feeds 
ADD COLUMN strip_inline_styles BOOLEAN NOT NULL DEFAULT true;