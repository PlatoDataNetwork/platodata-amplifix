-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule the auto-sync job to run every hour
SELECT cron.schedule(
  'auto-sync-rss-feeds',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://tmmerifhwscgicmncndl.supabase.co/functions/v1/auto-sync-feeds',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbWVyaWZod3NjZ2ljbW5jbmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzk1OTMsImV4cCI6MjA4Mjk1NTU5M30.WOILISehnKxQBhqOtD-RWY6DZz6YxCIA_kCZdHe7eF0"}'::jsonb,
    body := concat('{"triggered_at": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);