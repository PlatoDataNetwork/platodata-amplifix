UPDATE public.site_settings 
SET value = 'User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://www.platodata.io/sitemap.xml
Sitemap: https://www.platodata.io/ar/sitemap.xml
Sitemap: https://www.platodata.io/bn/sitemap.xml
Sitemap: https://www.platodata.io/zh-CN/sitemap.xml
Sitemap: https://www.platodata.io/zh-TW/sitemap.xml
Sitemap: https://www.platodata.io/da/sitemap.xml
Sitemap: https://www.platodata.io/nl/sitemap.xml
Sitemap: https://www.platodata.io/et/sitemap.xml
Sitemap: https://www.platodata.io/fi/sitemap.xml
Sitemap: https://www.platodata.io/fr/sitemap.xml
Sitemap: https://www.platodata.io/de/sitemap.xml
Sitemap: https://www.platodata.io/el/sitemap.xml
Sitemap: https://www.platodata.io/iw/sitemap.xml
Sitemap: https://www.platodata.io/hi/sitemap.xml
Sitemap: https://www.platodata.io/hu/sitemap.xml
Sitemap: https://www.platodata.io/id/sitemap.xml
Sitemap: https://www.platodata.io/it/sitemap.xml
Sitemap: https://www.platodata.io/ja/sitemap.xml
Sitemap: https://www.platodata.io/km/sitemap.xml
Sitemap: https://www.platodata.io/ko/sitemap.xml
Sitemap: https://www.platodata.io/no/sitemap.xml
Sitemap: https://www.platodata.io/fa/sitemap.xml
Sitemap: https://www.platodata.io/pl/sitemap.xml
Sitemap: https://www.platodata.io/pt/sitemap.xml
Sitemap: https://www.platodata.io/pa/sitemap.xml
Sitemap: https://www.platodata.io/ro/sitemap.xml
Sitemap: https://www.platodata.io/ru/sitemap.xml
Sitemap: https://www.platodata.io/sl/sitemap.xml
Sitemap: https://www.platodata.io/es/sitemap.xml
Sitemap: https://www.platodata.io/sv/sitemap.xml
Sitemap: https://www.platodata.io/th/sitemap.xml
Sitemap: https://www.platodata.io/tr/sitemap.xml
Sitemap: https://www.platodata.io/uk/sitemap.xml
Sitemap: https://www.platodata.io/ur/sitemap.xml
Sitemap: https://www.platodata.io/vi/sitemap.xml',
updated_at = now()
WHERE key = 'robots_txt';
