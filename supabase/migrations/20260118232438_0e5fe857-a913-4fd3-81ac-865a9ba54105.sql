-- Add duplicate checking columns to rss_feeds table
ALTER TABLE public.rss_feeds 
ADD COLUMN check_duplicate_title boolean NOT NULL DEFAULT false,
ADD COLUMN check_duplicate_link boolean NOT NULL DEFAULT false;