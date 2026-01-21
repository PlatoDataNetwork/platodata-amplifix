import { useEffect } from "react";
import { checkAndApplyTranslationFromCookie } from "@/lib/googleTranslate";
import { isSupportedLanguage } from "@/lib/i18nLanguages";

/**
 * Clear the googtrans cookie (set by Google Translate to persist language choice).
 * This must run BEFORE the Google Translate script loads to prevent auto-translation.
 */
function clearGoogTransCookies() {
  document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  // Also try with leading dot for subdomains
  document.cookie = `googtrans=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Determine the language from the URL. URL is the single source of truth.
 * Root "/" or any path without a valid language prefix → "en"
 */
function getLangFromUrl(): string {
  const seg0 = window.location.pathname.split("/").filter(Boolean)[0];
  return isSupportedLanguage(seg0) ? seg0 : "en";
}

const GoogleTranslateLoader = () => {
  useEffect(() => {
    const langFromUrl = getLangFromUrl();

    // ──────────────────────────────────────────────────────────────────────────
    // CRITICAL: If URL says English (no prefix), clear any stale googtrans cookie
    // BEFORE loading Google Translate, so Google won't auto-translate.
    // ──────────────────────────────────────────────────────────────────────────
    if (langFromUrl === "en") {
      clearGoogTransCookies();
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.classList.remove("translated-ltr", "translated-rtl");
      document.body.classList.remove("translated-ltr", "translated-rtl");
    }

    // Avoid loading the script multiple times
    if (document.getElementById("google-translate-script")) return;

    // Store original DOM methods to wrap them safely
    const originalRemoveChild = Node.prototype.removeChild;
    const originalInsertBefore = Node.prototype.insertBefore;

    // Wrap removeChild to handle Google Translate DOM conflicts
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child && child.parentNode === this) {
        return originalRemoveChild.call(this, child) as T;
      }
      // If not a child, just return the node without error
      return child;
    };

    // Wrap insertBefore to handle edge cases
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        // Reference node is not a child, append instead
        return this.appendChild(newNode) as T;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    // Also suppress console errors as a backup
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
      // After script loads, check if we should apply translation from cookie
      setTimeout(() => {
        // Only honor the cookie when the URL explicitly requests a language.
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
      
      /* But keep the hidden combo visible for our JS to interact with */
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
    `;
    document.head.appendChild(style);

    return () => {
      // Restore original methods
      Node.prototype.removeChild = originalRemoveChild;
      Node.prototype.insertBefore = originalInsertBefore;
      console.error = originalError;
      
      const scriptEl = document.getElementById("google-translate-script");
      const styleEl = document.getElementById("google-translate-style");
      if (scriptEl && scriptEl.parentNode) {
        try {
          scriptEl.parentNode.removeChild(scriptEl);
        } catch (e) { /* ignore */ }
      }
      if (styleEl && styleEl.parentNode) {
        try {
          styleEl.parentNode.removeChild(styleEl);
        } catch (e) { /* ignore */ }
      }
    };
  }, []);

  return null;
};

export default GoogleTranslateLoader;
