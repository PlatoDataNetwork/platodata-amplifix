import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLocation } from "react-router-dom";
import { LANGUAGES, type Language, isSupportedLanguage } from "@/lib/i18nLanguages";

// Helper to clear all googtrans cookies
function clearAllGoogTransCookies() {
  const domains = ['', window.location.hostname, '.' + window.location.hostname];
  domains.forEach(domain => {
    let cookieStr = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    if (domain) cookieStr += '; domain=' + domain;
    document.cookie = cookieStr;
  });
}

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Keep selection in sync with the URL prefix (e.g. /nl/...).
  useEffect(() => {
    const seg0 = location.pathname.split("/").filter(Boolean)[0];
    const langFromUrl = isSupportedLanguage(seg0) ? seg0 : "en";
    const found = LANGUAGES.find((l) => l.code === langFromUrl) || LANGUAGES[0];
    setCurrentLang(found);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildPathForLang = (targetLang: string) => {
    const segments = location.pathname.split("/").filter(Boolean);
    const first = segments[0];
    const hasLangPrefix = isSupportedLanguage(first);

    if (targetLang === "en") {
      if (hasLangPrefix) segments.shift();
      return "/" + segments.join("/") + location.search + location.hash;
    }

    if (hasLangPrefix) {
      segments[0] = targetLang;
    } else {
      segments.unshift(targetLang);
    }

    return "/" + segments.join("/") + location.search + location.hash;
  };

  const handleLanguageSelect = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);

    // STEP 1: Clear ALL existing cookies first
    clearAllGoogTransCookies();
    
    // STEP 2: Clear localStorage items Google Translate might use
    try {
      localStorage.removeItem('googtrans');
      localStorage.removeItem('google_translate_element');
    } catch(e) { /* ignore */ }

    // STEP 3: Build the new path
    const newPath = buildPathForLang(lang.code);
    
    // STEP 4: If switching to a non-English language, set the correct cookie
    if (lang.code !== "en") {
      document.cookie = `googtrans=/en/${lang.code}; path=/`;
      document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
    }
    
    // STEP 5: Force hard navigation with cache busting to ensure fresh page load
    // Add a timestamp to prevent browser from using cached translated content
    const separator = newPath.includes('?') ? '&' : '?';
    const cacheBuster = `_gt=${Date.now()}`;
    window.location.href = newPath + separator + cacheBuster;
  };

  return (
    <div ref={dropdownRef} className="relative notranslate" translate="no">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted/50"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl z-[100] animate-in fade-in-0 zoom-in-95 notranslate" translate="no">
          <div className="p-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors notranslate ${
                  currentLang.code === lang.code
                    ? "bg-primary/20 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
                translate="no"
              >
                <span className="text-lg notranslate" translate="no">{lang.flag}</span>
                <span className="font-medium notranslate" translate="no">{lang.name}</span>
                {currentLang.code === lang.code && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
