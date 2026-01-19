import { useLocation } from "react-router-dom";
import { isSupportedLanguage } from "@/lib/i18nLanguages";

function splitPathParts(path: string) {
  const match = path.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return {
    base: match?.[1] ?? path,
    query: match?.[2] ?? "",
    hash: match?.[3] ?? "",
  };
}

export function useLangRouting() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const maybeLang = segments[0];
  const hasPrefix = isSupportedLanguage(maybeLang) && maybeLang !== "en";
  const lang = isSupportedLanguage(maybeLang) ? maybeLang : "en";
  const prefix = hasPrefix ? `/${lang}` : "";

  const withLang = (path: string) => {
    // Only prefix absolute internal paths
    if (!path.startsWith("/")) return path;

    if (!hasPrefix) return path;

    const { base, query, hash } = splitPathParts(path);

    if (base === "/") return `${prefix}/${query}${hash}`;
    return `${prefix}${base}${query}${hash}`;
  };

  return { lang, hasPrefix, prefix, withLang };
}
