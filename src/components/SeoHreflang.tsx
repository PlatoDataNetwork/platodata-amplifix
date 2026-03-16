import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { LANGUAGES, isSupportedLanguage } from "@/lib/i18nLanguages";

const SITE_URL = "https://www.platodata.io";

/**
 * Injects <link rel="canonical"> and <link rel="alternate" hreflang="..."> tags
 * into <head> based on the current URL path. Supports both English (no prefix)
 * and language-prefixed routes.
 */
const SeoHreflang = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const firstSeg = segments[0];
  const hasLangPrefix = isSupportedLanguage(firstSeg) && firstSeg !== "en";

  // Get the path without the language prefix
  const pathWithoutLang = hasLangPrefix
    ? "/" + segments.slice(1).join("/")
    : location.pathname;
  const normalizedPath = pathWithoutLang === "/" ? "" : pathWithoutLang;

  // Canonical URL includes lang prefix if present
  const canonicalUrl = hasLangPrefix
    ? `${SITE_URL}/${firstSeg}${normalizedPath}`
    : `${SITE_URL}${normalizedPath || "/"}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      {/* x-default points to English (no prefix) */}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${normalizedPath || "/"}`} />
      {LANGUAGES.map((lang) => {
        const href =
          lang.code === "en"
            ? `${SITE_URL}${normalizedPath || "/"}`
            : `${SITE_URL}/${lang.code}${normalizedPath}`;
        return (
          <link
            key={lang.code}
            rel="alternate"
            hrefLang={lang.code}
            href={href}
          />
        );
      })}
    </Helmet>
  );
};

export default SeoHreflang;
