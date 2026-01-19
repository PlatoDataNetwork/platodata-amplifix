import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { isSupportedLanguage } from "@/lib/i18nLanguages";
import { applyGoogleTranslateLanguage } from "@/lib/googleTranslate";
import NotFound from "@/pages/NotFound";

const LangLayout = () => {
  const { lang } = useParams<{ lang: string }>();

  if (!isSupportedLanguage(lang)) {
    return <NotFound />;
  }

  useEffect(() => {
    applyGoogleTranslateLanguage(lang);
  }, [lang]);

  return <Outlet />;
};

export default LangLayout;
