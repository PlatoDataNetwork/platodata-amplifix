-- Create enum for feed sync status
CREATE TYPE public.feed_status AS ENUM ('active', 'paused', 'error');

-- Create enum for article import mode
CREATE TYPE public.feed_import_mode AS ENUM ('full_content', 'excerpt_with_link');

-- Create enum for article publish status
CREATE TYPE public.feed_publish_status AS ENUM ('publish', 'draft');

-- Create RSS feeds table
CREATE TABLE public.rss_feeds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    feed_url text NOT NULL,
    vertical_slug text NOT NULL,
    status feed_status NOT NULL DEFAULT 'active',
    import_mode feed_import_mode NOT NULL DEFAULT 'full_content',
    publish_status feed_publish_status NOT NULL DEFAULT 'draft',
    auto_sync boolean NOT NULL DEFAULT false,
    sync_interval_hours integer NOT NULL DEFAULT 24,
    last_synced_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create feed sync log table to track imported articles
CREATE TABLE public.feed_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id uuid REFERENCES public.rss_feeds(id) ON DELETE CASCADE NOT NULL,
    article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
    original_guid text NOT NULL,
    original_url text,
    synced_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(feed_id, original_guid)
);

-- Enable RLS
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for rss_feeds
CREATE POLICY "Admins can view all feeds"
ON public.rss_feeds FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert feeds"
ON public.rss_feeds FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update feeds"
ON public.rss_feeds FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete feeds"
ON public.rss_feeds FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for feed_sync_logs
CREATE POLICY "Admins can view all sync logs"
ON public.feed_sync_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync logs"
ON public.feed_sync_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sync logs"
ON public.feed_sync_logs FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_rss_feeds_updated_at
BEFORE UPDATE ON public.rss_feeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();