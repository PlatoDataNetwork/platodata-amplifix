import { useState, useEffect } from 'react';

type TranslationData = Record<string, unknown>;

// Cache for loaded translations
let translationsCache: TranslationData | null = null;
let loadingPromise: Promise<TranslationData> | null = null;

export const useTranslations = () => {
  const [translations, setTranslations] = useState<TranslationData>(translationsCache || {});
  const [isLoading, setIsLoading] = useState(!translationsCache);

  useEffect(() => {
    const loadTranslations = async () => {
      // Return cached translations if available
      if (translationsCache) {
        setTranslations(translationsCache);
        setIsLoading(false);
        return;
      }

      // If already loading, wait for that promise
      if (loadingPromise) {
        const data = await loadingPromise;
        setTranslations(data);
        setIsLoading(false);
        return;
      }

      // Start loading translations
      loadingPromise = fetch('/locales/en.json')
        .then(res => res.json())
        .then(data => {
          translationsCache = data;
          return data;
        })
        .catch(err => {
          console.error('Failed to load translations:', err);
          return {};
        });

      const data = await loadingPromise;
      setTranslations(data);
      setIsLoading(false);
    };

    loadTranslations();
  }, []);

  /**
   * Get a translation by dot-notation path
   * e.g., t('hero.title') returns the value at translations.hero.title
   */
  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let value: unknown = translations;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return fallback || path;
      }
    }
    
    return typeof value === 'string' ? value : (fallback || path);
  };

  /**
   * Get a nested object by path
   * e.g., getSection('features.items') returns the items object
   */
  const getSection = <T = unknown>(path: string): T | null => {
    const keys = path.split('.');
    let value: unknown = translations;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return null;
      }
    }
    
    return value as T;
  };

  /**
   * Get an array by path
   */
  const getArray = (path: string): string[] => {
    const result = getSection<string[]>(path);
    return Array.isArray(result) ? result : [];
  };

  return { t, getSection, getArray, isLoading, translations };
};

export default useTranslations;
