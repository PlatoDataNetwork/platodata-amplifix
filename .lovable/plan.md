

## Analysis: Korean Sitemap — 0 Discovered Pages in GSC

### Investigation Findings

I verified the sitemap infrastructure is technically working:
- `/ko/sitemap.xml` returns valid XML with 30+ child sitemaps
- `/ko/post-sitemap1.xml` returns valid XML with correct `/ko/...` URLs and hreflang tags
- Vercel routing correctly proxies all language-prefixed sitemap files to the edge function

### Root Causes

**1. Crawler pre-rendering missing for Korean URLs**
The `vercel.json` crawler rewrite (line 86-95) only handles `/w3ai/:postId/:vertical/:slug` — it does NOT handle `/:lang/w3ai/:postId/:vertical/:slug`. When Googlebot visits a Korean article URL, it gets the raw SPA shell instead of the `og-meta` function's pre-rendered response. This may cause Google to deprioritize or skip these URLs.

**2. Hardcoded `<html lang="en">`**
The `index.html` has `<html lang="en">` regardless of the URL language prefix. This signals to Google that all pages are English, which contradicts the hreflang declarations in the sitemap.

**3. No canonical or hreflang tags in HTML head**
The HTML `<head>` has no `<link rel="canonical">` or `<link rel="alternate" hreflang="...">` tags. Google relies heavily on these in-page signals — sitemap hreflang alone is often insufficient.

**4. Possible GSC timing**
If the Korean sitemap was submitted recently, Google may still be processing it. The English sitemap likely had months of crawl history.

### Plan

**Step 1 — Add crawler rewrite for lang-prefixed article URLs in `vercel.json`**
Add a new rewrite rule before the catch-all that routes `/:lang/w3ai/:postId/:vertical/:slug` to the `og-meta` function for crawlers, passing the lang param. This ensures Googlebot gets pre-rendered metadata for Korean articles.

**Step 2 — Update `og-meta` edge function to accept and use `lang` parameter**
Pass the language through so the og-meta response includes the correct `og:locale`, canonical URL with lang prefix, and hreflang alternate links.

**Step 3 — Dynamically set `<html lang>` attribute in the React app**
In `LangLayout.tsx` (or a shared hook), set `document.documentElement.lang` to the current URL language prefix so Google sees the correct language signal.

**Step 4 — Inject canonical and hreflang `<link>` tags in `<head>` via React Helmet or DOM manipulation**
Add `<link rel="canonical">` pointing to the current lang-prefixed URL, and `<link rel="alternate" hreflang="...">` for all supported languages. This gives Google in-page hreflang signals alongside the sitemap ones.

**Step 5 — Deploy and resubmit**
After deploying, request re-processing of the Korean sitemap in GSC.

