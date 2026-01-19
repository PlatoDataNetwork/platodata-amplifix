import { useEffect } from "react";

const GoogleTranslateLoader = () => {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
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
      #google_translate_element { display: none !important; }
      .goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      .skiptranslate { display: none !important; height: 0 !important; }
      body { top: 0 !important; position: static !important; }
      body.translated-ltr { margin-top: 0 !important; }
      body.translated-rtl { margin-top: 0 !important; }
      .goog-te-gadget { display: none !important; }
      .goog-te-gadget-icon { display: none !important; }
      .goog-te-menu-frame { display: none !important; }
      iframe.goog-te-banner-frame { display: none !important; }
      #goog-gt-tt { display: none !important; }
      .goog-te-balloon-frame { display: none !important; }
      .goog-tooltip { display: none !important; }
      .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default GoogleTranslateLoader;
