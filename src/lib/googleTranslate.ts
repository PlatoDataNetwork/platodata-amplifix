function setGoogTransCookie(value: string) {
  // Both variants help across different hosting / subdomain setups
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
}

function clearGoogTransCookie() {
  // Clear the cookie by setting it to empty and expired
  document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function triggerTranslateSelect(langCode: string) {
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (!select) return false;

  // Google Translate uses empty value to represent the original language
  select.value = langCode === "en" ? "" : langCode;
  select.dispatchEvent(new Event("change"));
  return true;
}

function restoreOriginalContent() {
  // Try to click the "Show original" link if available
  const showOriginalLink = document.querySelector(".goog-te-banner-frame");
  if (showOriginalLink) {
    try {
      const iframe = showOriginalLink as HTMLIFrameElement;
      const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const restoreBtn = innerDoc?.querySelector(".goog-te-button button");
      if (restoreBtn) {
        (restoreBtn as HTMLButtonElement).click();
        return true;
      }
    } catch (e) {
      // Cross-origin issues, fallback to cookie clear + reload
    }
  }
  return false;
}

export function applyGoogleTranslateLanguage(langCode: string) {
  const target = langCode || "en";

  if (target === "en") {
    // Clear translation cookies and restore original content
    clearGoogTransCookie();
    document.documentElement.setAttribute("lang", "en");
    
    // Try to restore original content without reload first
    if (triggerTranslateSelect("en")) {
      // Give it a moment to reset, then check if we need to reload
      setTimeout(() => {
        // If Google Translate banner is still visible, force reload
        const banner = document.querySelector(".goog-te-banner-frame");
        if (banner && !restoreOriginalContent()) {
          // Force reload to clear all translations
          window.location.reload();
        }
      }, 300);
      return;
    }
    
    // Widget not loaded, just reload to get clean state
    window.location.reload();
    return;
  }

  // Setting the cookie makes Google Translate keep state across refreshes.
  setGoogTransCookie(`/en/${target}`);

  // Also set document language for accessibility/SEO hints (content is still translated client-side).
  document.documentElement.setAttribute("lang", target);

  // If the widget hasn't mounted yet, retry briefly without forcing a reload.
  if (triggerTranslateSelect(target)) return;

  let tries = 0;
  const interval = window.setInterval(() => {
    tries += 1;
    if (triggerTranslateSelect(target) || tries > 25) {
      window.clearInterval(interval);
    }
  }, 150);
}
