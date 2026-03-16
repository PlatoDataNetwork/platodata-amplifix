import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { isSupportedLanguage } from "@/lib/i18nLanguages";
import { applyGoogleTranslateLanguage, resetTranslationState } from "@/lib/googleTranslate";
import NotFound from "@/pages/NotFound";

const LangLayout = () => {
  const { lang } = useParams<{ lang: string }>();
  const isSupported = isSupportedLanguage(lang);

  useEffect(() => {
    if (!isSupported) return;

    // Set <html lang="xx"> for SEO — crawlers use this signal
    document.documentElement.lang = lang || "en";

    // Reset stale state before applying new language to prevent blocking
    resetTranslationState();
    applyGoogleTranslateLanguage(lang);

    return () => {
      document.documentElement.lang = "en";
    };
  }, [lang, isSupported]);

  if (!isSupported) {
    return <NotFound />;
  }

  return <Outlet />;
};

export default LangLayout;
