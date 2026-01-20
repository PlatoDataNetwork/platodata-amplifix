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

function waitForTranslateWidget(): Promise<boolean> {
  return new Promise((resolve) => {
    let tries = 0;
    const maxTries = 30;
    
    const check = () => {
      tries++;
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (select) {
        resolve(true);
      } else if (tries >= maxTries) {
        resolve(false);
      } else {
        setTimeout(check, 100);
      }
    };
    
    check();
  });
}

export async function applyGoogleTranslateLanguage(langCode: string) {
  const target = langCode || "en";

  if (target === "en") {
    // Clear translation cookies
    clearGoogTransCookie();
    document.documentElement.setAttribute("lang", "en");
    
    // Try to reset via the select dropdown
    const widgetReady = await waitForTranslateWidget();
    if (widgetReady) {
      triggerTranslateSelect("en");
      // Give it time to revert, if it doesn't work, the page will be clean on next load
      setTimeout(() => {
        // Check if translation is still active
        const isTranslated = document.documentElement.classList.contains("translated-ltr") ||
                            document.documentElement.classList.contains("translated-rtl");
        if (isTranslated) {
          // Force a clean reload if translation persists
          window.location.reload();
        }
      }, 500);
    }
    return;
  }

  // Setting the cookie makes Google Translate keep state across refreshes.
  setGoogTransCookie(`/en/${target}`);

  // Also set document language for accessibility/SEO hints (content is still translated client-side).
  document.documentElement.setAttribute("lang", target);

  // Wait for widget to be ready, then trigger translation
  const widgetReady = await waitForTranslateWidget();
  if (widgetReady) {
    triggerTranslateSelect(target);
  }
}
