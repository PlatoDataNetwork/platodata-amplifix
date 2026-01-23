import { useEffect } from "react";
import { checkAndApplyTranslationFromCookie } from "@/lib/googleTranslate";
import { isSupportedLanguage } from "@/lib/i18nLanguages";
import { useLocation } from "react-router-dom";

const GTranslateBridge = () => {
  const location = useLocation();

  useEffect(() => {
    const seg0 = location.pathname.split("/").filter(Boolean)[0];
    const langFromUrl = isSupportedLanguage(seg0) ? seg0 : "en";

    // Ensure cookie matches current URL language for persistence
    if (langFromUrl !== "en") {
      try {
        const domains = [ "", window.location.hostname, "." + window.location.hostname ];
        const base = window.location.hostname.startsWith("www.")
          ? window.location.hostname.slice(4)
          : null;
        if (base && base !== window.location.hostname) {
          domains.push(base, "." + base);
        }
        const unique = Array.from(new Set(domains));
        unique.forEach((domain) => {
          let cookieStr = `googtrans=/en/${langFromUrl}; path=/`;
          if (domain) cookieStr += `; domain=${domain}`;
          document.cookie = cookieStr;
        });
      } catch {
        // ignore cookie errors
      }
    }

    // Trigger translation if cookie indicates non-English
    checkAndApplyTranslationFromCookie();
  }, [location.pathname]);

  return null;
};

export default GTranslateBridge;

