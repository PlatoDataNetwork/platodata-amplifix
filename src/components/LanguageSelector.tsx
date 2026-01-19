import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "bn", name: "Bengali", flag: "🇧🇩" },
  { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "et", name: "Estonian", flag: "🇪🇪" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "iw", name: "Hebrew", flag: "🇮🇱" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "km", name: "Khmer", flag: "🇰🇭" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fa", name: "Persian", flag: "🇮🇷" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "sl", name: "Slovenian", flag: "🇸🇮" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "ur", name: "Urdu", flag: "🇵🇰" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect current language from cookie or localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
      const foundLang = languages.find(l => l.code === savedLang);
      if (foundLang) {
        setCurrentLang(foundLang);
      }
    }
  }, []);

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

  // Load Google Translate script
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById("google-translate-script")) return;

    // Add Google Translate initialization
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Add the script
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Hide the default Google Translate widget
    const style = document.createElement("style");
    style.textContent = `
      #google_translate_element { display: none !important; }
      .goog-te-banner-frame { display: none !important; }
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      .goog-te-gadget { display: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    localStorage.setItem("selectedLanguage", lang.code);

    // Trigger Google Translate
    const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    
    if (selectElement) {
      if (lang.code === "en") {
        // Reset to original language
        selectElement.value = "";
        selectElement.dispatchEvent(new Event("change"));
        // Also try to restore original
        const iframe = document.querySelector(".goog-te-menu-frame") as HTMLIFrameElement;
        if (iframe) {
          const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
          const restoreLink = innerDoc?.querySelector(".goog-te-menu2-item span.text:first-child");
          if (restoreLink) {
            (restoreLink as HTMLElement).click();
          }
        }
        // Fallback: reload the page without translation
        const currentUrl = window.location.href;
        if (currentUrl.includes("googtrans")) {
          window.location.href = window.location.pathname + window.location.search;
        }
      } else {
        selectElement.value = lang.code;
        selectElement.dispatchEvent(new Event("change"));
      }
    } else {
      // If Google Translate hasn't loaded yet, set a cookie and reload
      document.cookie = `googtrans=/en/${lang.code}; path=/`;
      document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
      window.location.reload();
    }
  };

  return (
    <div ref={dropdownRef} className="relative notranslate">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted/50"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl z-[100] animate-in fade-in-0 zoom-in-95">
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${
                  currentLang.code === lang.code
                    ? "bg-primary/20 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
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
