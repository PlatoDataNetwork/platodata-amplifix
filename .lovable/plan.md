

## PageSpeed Optimization Plan (Mobile Score: 60 -> Target: 75+)

The screenshot shows two main opportunities flagged by Google PageSpeed Insights, plus slow Core Web Vitals. Here is how to address each.

---

### 1. Reduce Unused JavaScript (saves ~1.56s)

Currently, all page routes (Intel, DataFeeds, ApiDocs, Login, Management, etc.) are **eagerly imported** in `App.tsx`. A visitor landing on the homepage downloads JavaScript for every page.

**Fix**: Use `React.lazy()` and `Suspense` to code-split routes. Only the homepage components load immediately; all other pages load on demand.

**File**: `src/App.tsx`
- Convert all non-homepage route imports to `React.lazy()` (Solutions, Intel, IntelVertical, ArticlePage, DataFeeds, ApiDocs, Login, Management, NotFound)
- Wrap `<Routes>` in a `<Suspense>` boundary with a minimal loading fallback

---

### 2. Avoid Multiple Page Redirects (saves ~1.11s)

The `vercel.json` has a redirect rule that catches double language prefixes (e.g., `/nl/nl/page` -> `/nl/page`). While necessary, a second redirect adds `/lang` -> `/lang/` (appending trailing slash), which can create a chain:
`/nl` -> `/nl/` -> serve page (2 redirects).

**Fix**: Combine the trailing-slash redirect into the SPA rewrite so it is handled in a single hop rather than a redirect chain.

**File**: `vercel.json`
- Remove the separate trailing-slash redirect for language paths (line 9-12)
- Add a rewrite rule for `/:lang` (without slash) that serves `index.html` directly, avoiding the redirect

---

### 3. Optimize Render-Blocking Resources (improves FCP/LCP)

The Google Fonts stylesheet in `index.html` is render-blocking. The gtranslate script, while deferred, still adds weight.

**File**: `index.html`
- Change the Google Fonts `<link rel="stylesheet">` to `<link rel="preload" as="style" onload="this.rel='stylesheet'">` with a `<noscript>` fallback, so fonts load non-blocking
- Add `fetchpriority="high"` is not needed since fonts are already preconnected

---

### 4. Lazy Load Below-the-Fold Images

Blog article images and other below-fold images should use native lazy loading.

**File**: `src/components/Blog.tsx`
- Add `loading="lazy"` to the article `<img>` tags

**File**: `src/components/Hero.tsx`
- No images to optimize here (text only)

---

### Summary of File Changes

| File | Change |
|------|--------|
| `src/App.tsx` | Lazy-load all non-homepage routes with `React.lazy` + `Suspense` |
| `vercel.json` | Remove trailing-slash redirect to eliminate redirect chains |
| `index.html` | Make Google Fonts non-render-blocking with preload pattern |
| `src/components/Blog.tsx` | Add `loading="lazy"` to article images |

