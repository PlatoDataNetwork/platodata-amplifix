import { useEffect } from "react";
import { checkAndApplyTranslationFromCookie } from "@/lib/googleTranslate";
import { isSupportedLanguage } from "@/lib/i18nLanguages";

/**
 * Clear all googtrans cookies (set by Google Translate to persist language choice).
 */
function clearAllGoogTransCookies() {
  const domains = ['', window.location.hostname, '.' + window.location.hostname];
  domains.forEach(domain => {
    let cookieStr = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    if (domain) cookieStr += '; domain=' + domain;
    document.cookie = cookieStr;
  });
}

/**
 * Determine the language from the URL. URL is the single source of truth.
 * Root "/" or any path without a valid language prefix → "en"
 */
function getLangFromUrl(): string {
  const seg0 = window.location.pathname.split("/").filter(Boolean)[0];
  return isSupportedLanguage(seg0) ? seg0 : "en";
}

/**
 * Get the language from the googtrans cookie
 */
function getCookieLang(): string | null {
  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z\-]+)/);
  return match ? match[1] : null;
}

const GoogleTranslateLoader = () => {
  useEffect(() => {
    const langFromUrl = getLangFromUrl();
    const cookieLang = getCookieLang();

    let classObserver: MutationObserver | null = null;
    
    // ──────────────────────────────────────────────────────────────────────────
    // ENGLISH (no prefix): Clear cookies and prevent translation
    // ──────────────────────────────────────────────────────────────────────────
    if (langFromUrl === "en") {
      clearAllGoogTransCookies();
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.classList.remove("translated-ltr", "translated-rtl");
      document.body.classList.remove("translated-ltr", "translated-rtl");
      
      // Set up observer to immediately remove translation classes if Google adds them
      classObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains('translated-ltr') || target.classList.contains('translated-rtl')) {
              target.classList.remove('translated-ltr', 'translated-rtl');
            }
          }
        });
      });
      
      classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      classObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      
      // Stop observing after 10 seconds
      setTimeout(() => classObserver?.disconnect(), 10000);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // NON-ENGLISH: Ensure cookie matches URL
    // ──────────────────────────────────────────────────────────────────────────
    else {
      // If cookie doesn't match URL, fix it
      if (cookieLang !== langFromUrl) {
        clearAllGoogTransCookies();
        document.cookie = `googtrans=/en/${langFromUrl}; path=/`;
        document.cookie = `googtrans=/en/${langFromUrl}; path=/; domain=${window.location.hostname}`;
      }
    }

    // Avoid loading the script multiple times
    if (document.getElementById("google-translate-script")) {
      // Script already loaded, just trigger translation if needed
      if (langFromUrl !== "en") {
        setTimeout(() => checkAndApplyTranslationFromCookie(), 500);
      }
      return;
    }

    // Store original DOM methods to wrap them safely
    const originalRemoveChild = Node.prototype.removeChild;
    const originalInsertBefore = Node.prototype.insertBefore;

    // Wrap removeChild to handle Google Translate DOM conflicts
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child && child.parentNode === this) {
        return originalRemoveChild.call(this, child) as T;
      }
      return child;
    };

    // Wrap insertBefore to handle edge cases
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return this.appendChild(newNode) as T;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    // Suppress console errors from Google Translate
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString?.() || "";
      if (
        message.includes("removeChild") ||
        message.includes("The node to be removed is not a child") ||
        message.includes("insertBefore")
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    // Initialize Google Translate
    (window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
            layout: (window as any).google.translate.TranslateElement?.InlineLayout?.SIMPLE,
          },
          "google_translate_element"
        );
      } catch (e) {
        console.warn("Google Translate init error:", e);
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onload = () => {
      // After script loads, apply translation ONLY if URL has language prefix
      setTimeout(() => {
        if (langFromUrl !== "en") {
          checkAndApplyTranslationFromCookie();
        }
      }, 500);
    };
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.id = "google-translate-style";
    style.textContent = `
      /* Hide Google Translate UI completely */
      #google_translate_element { 
        display: none !important; 
        visibility: hidden !important; 
        height: 0 !important; 
        width: 0 !important; 
        overflow: hidden !important; 
        position: absolute !important;
        left: -9999px !important;
      }
      
      /* Hide the banner frame */
      .goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      iframe.goog-te-banner-frame { 
        display: none !important; 
        visibility: hidden !important; 
        height: 0 !important;
        width: 0 !important;
      }
      
      /* Hide skip translate elements but keep widget container functional */
      .skiptranslate:not(#google_translate_element) { 
        display: none !important; 
        height: 0 !important; 
        visibility: hidden !important; 
      }
      
      /* Keep the translate element container visible but off-screen */
      #google_translate_element.skiptranslate {
        display: block !important;
        visibility: visible !important;
        position: absolute !important;
        left: -9999px !important;
        height: 1px !important;
        width: 1px !important;
        overflow: hidden !important;
      }
      
      /* Keep the hidden combo visible for our JS to interact with */
      .goog-te-combo {
        visibility: visible !important;
        display: inline-block !important;
        position: absolute !important;
        left: -9999px !important;
      }
      
      /* Prevent body displacement */
      body { 
        top: 0 !important; 
        position: static !important; 
        margin-top: 0 !important; 
      }
      body.translated-ltr, body.translated-rtl { 
        margin-top: 0 !important; 
        top: 0 !important; 
      }
      html.translated-ltr, html.translated-rtl { 
        margin-top: 0 !important; 
      }
      
      /* Hide all Google Translate gadgets and UI */
      .goog-te-gadget,
      .goog-te-gadget-icon,
      .goog-te-menu-frame,
      .goog-te-menu-value { 
        display: none !important; 
      }
      
      /* Hide tooltips and highlights */
      #goog-gt-tt,
      .goog-te-balloon-frame,
      .goog-tooltip { 
        display: none !important; 
        visibility: hidden !important; 
      }
      .goog-text-highlight { 
        background-color: transparent !important; 
        box-shadow: none !important; 
      }
      
      /* Prevent translated content styling issues */
      .goog-te-spinner-pos { 
        display: none !important; 
      }
      font[style*="vertical-align: inherit"] { 
        vertical-align: baseline !important; 
      }
      
      /* ── Robust: Hide Google Translate popups/overlays/loaders ── */
      /* Target by known class fragments (wildcard) */
      [class*="VIpgJd"],
      [class*="ZVi9od"],
      [class*="aZ2wEe"],
      [class*="wOHMyf"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
        position: fixed !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: -1 !important;
      }
      
      /* Target Google Translate iframes that act as overlays */
      iframe[id^="goog-"],
      iframe[class*="goog-"],
      iframe[src*="translate.google"],
      iframe[src*="translate_a"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
      }
      
      /* Hide any fixed/absolute positioned Google overlay divs */
      div[id^="goog-gt-"],
      div[class*="goog-te-ftab"],
      div[class*="goog-te-spinner"],
      div[class*="goog-te-menu2"] {
        display: none !important;
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      classObserver?.disconnect();
      Node.prototype.removeChild = originalRemoveChild;
      Node.prototype.insertBefore = originalInsertBefore;
      console.error = originalError;
      
      const scriptEl = document.getElementById("google-translate-script");
      const styleEl = document.getElementById("google-translate-style");
      if (scriptEl?.parentNode) {
        try { scriptEl.parentNode.removeChild(scriptEl); } catch (e) { /* ignore */ }
      }
      if (styleEl?.parentNode) {
        try { styleEl.parentNode.removeChild(styleEl); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  return null;
};

export default GoogleTranslateLoader;
