-- Insert default robots.txt content
INSERT INTO public.site_settings (key, value) VALUES
  ('robots_txt', 'User-agent: *
Allow: /

Sitemap: https://www.platodata.io/sitemap.xml')
ON CONFLICT (key) DO NOTHING;