import { useEffect } from "react";

const GoogleTranslateLoader = () => {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    // Store original React error handler to restore later
    const originalError = console.error;
    
    // Suppress the specific removeChild error caused by Google Translate + React conflict
    console.error = (...args) => {
      const message = args[0]?.toString?.() || "";
      if (
        message.includes("removeChild") ||
        message.includes("The node to be removed is not a child")
      ) {
        // Silently ignore this known Google Translate + React conflict
        return;
      }
      originalError.apply(console, args);
    };

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          // Use SIMPLE layout to minimize DOM interference
          layout: (window as any).google.translate.TranslateElement?.InlineLayout?.SIMPLE,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.id = "google-translate-style";
    style.textContent = `
      /* Hide Google Translate UI completely */
      #google_translate_element { display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important; overflow: hidden !important; }
      .goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      .skiptranslate { display: none !important; height: 0 !important; visibility: hidden !important; }
      
      /* Prevent body displacement */
      body { top: 0 !important; position: static !important; margin-top: 0 !important; }
      body.translated-ltr { margin-top: 0 !important; top: 0 !important; }
      body.translated-rtl { margin-top: 0 !important; top: 0 !important; }
      html.translated-ltr { margin-top: 0 !important; }
      html.translated-rtl { margin-top: 0 !important; }
      
      /* Hide all Google Translate gadgets and UI */
      .goog-te-gadget { display: none !important; }
      .goog-te-gadget-icon { display: none !important; }
      .goog-te-menu-frame { display: none !important; }
      .goog-te-menu-value { display: none !important; }
      iframe.goog-te-banner-frame { display: none !important; }
      
      /* Hide tooltips and highlights */
      #goog-gt-tt { display: none !important; visibility: hidden !important; }
      .goog-te-balloon-frame { display: none !important; }
      .goog-tooltip { display: none !important; }
      .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
      
      /* Prevent translated content from having unwanted styling */
      .goog-te-spinner-pos { display: none !important; }
      font[style*="vertical-align: inherit"] { vertical-align: baseline !important; }
    `;
    document.head.appendChild(style);

    return () => {
      // Restore original console.error
      console.error = originalError;
      
      const scriptEl = document.getElementById("google-translate-script");
      const styleEl = document.getElementById("google-translate-style");
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  return null;
};

export default GoogleTranslateLoader;
