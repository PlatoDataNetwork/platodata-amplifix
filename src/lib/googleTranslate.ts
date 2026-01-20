function setGoogTransCookie(value: string) {
  // Set cookie for both root and current domain
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
}

function clearGoogTransCookie() {
  document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function getGoogleTranslateSelect(): HTMLSelectElement | null {
  return document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
}

function triggerTranslateSelect(langCode: string): boolean {
  const select = getGoogleTranslateSelect();
  if (!select) return false;

  // Google Translate uses empty value to represent original language
  select.value = langCode === "en" ? "" : langCode;
  
  // Trigger multiple event types to ensure Google catches it
  const events = ["change", "input"];
  events.forEach(eventType => {
    select.dispatchEvent(new Event(eventType, { bubbles: true }));
  });
  
  return true;
}

function waitForTranslateWidget(maxWait = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      const select = getGoogleTranslateSelect();
      if (select && select.options.length > 1) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime >= maxWait) {
        resolve(false);
        return;
      }
      
      setTimeout(check, 100);
    };
    
    // Start checking after a small delay for script to load
    setTimeout(check, 50);
  });
}

export async function applyGoogleTranslateLanguage(langCode: string): Promise<void> {
  const target = langCode || "en";

  if (target === "en") {
    // Clear translation cookies
    clearGoogTransCookie();
    document.documentElement.setAttribute("lang", "en");
    
    // Try to reset via the select dropdown
    const widgetReady = await waitForTranslateWidget();
    if (widgetReady) {
      triggerTranslateSelect("en");
      
      // Give it time to revert
      await new Promise(r => setTimeout(r, 300));
      
      // If translation classes still present, we need a reload
      const isStillTranslated = 
        document.documentElement.classList.contains("translated-ltr") ||
        document.documentElement.classList.contains("translated-rtl") ||
        document.body.classList.contains("translated-ltr") ||
        document.body.classList.contains("translated-rtl");
        
      if (isStillTranslated) {
        // Remove the classes manually as a last resort
        document.documentElement.classList.remove("translated-ltr", "translated-rtl");
        document.body.classList.remove("translated-ltr", "translated-rtl");
      }
    }
    return;
  }

  // Set the cookie for persistence across page loads
  setGoogTransCookie(`/en/${target}`);

  // Set document language attribute for accessibility
  document.documentElement.setAttribute("lang", target);

  // Wait for widget to be ready, then trigger translation
  const widgetReady = await waitForTranslateWidget();
  if (widgetReady) {
    triggerTranslateSelect(target);
  } else {
    // Widget not ready - try reloading the page to apply translation from cookie
    console.warn("Google Translate widget not ready, reloading to apply translation");
    window.location.reload();
  }
}

// Check if translation should be applied on page load (from cookie)
export function checkAndApplyTranslationFromCookie(): void {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "googtrans" && value) {
      // Cookie format: /en/targetLang
      const match = value.match(/\/en\/([a-z]{2})/);
      if (match && match[1] !== "en") {
        // There's a translation cookie, ensure widget is triggered
        waitForTranslateWidget().then(ready => {
          if (ready) {
            triggerTranslateSelect(match[1]);
          }
        });
      }
      break;
    }
  }
}
