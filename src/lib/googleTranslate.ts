// Track if translation has been applied to prevent loops
let translationApplied = false;
let lastAppliedLang: string | null = null;

// Retry control for when the Google Translate widget isn't ready yet.
let retryTimer: number | null = null;
let retryLang: string | null = null;
let retryAttempt = 0;

const RETRY_DELAYS_MS = [250, 500, 1000, 2000, 3500, 5000];

function getCookieDomains(): string[] {
  const host = window.location.hostname;
  const base = host.startsWith("www.") ? host.slice(4) : host;
  const domains = new Set<string>();
  domains.add("");
  domains.add(host);
  domains.add(`.${host}`);
  // IMPORTANT: include apex domain cookies (e.g. .platodata.io) when on www.
  if (base && base !== host) {
    domains.add(base);
    domains.add(`.${base}`);
  }
  return Array.from(domains);
}

function setGoogTransCookie(value: string) {
  // Set cookie across host + apex domain variants to avoid stale cookies winning.
  for (const domain of getCookieDomains()) {
    let cookieStr = `googtrans=${value}; path=/`;
    if (domain) cookieStr += `; domain=${domain}`;
    document.cookie = cookieStr;
  }
}

function clearGoogTransCookie() {
  for (const domain of getCookieDomains()) {
    let cookieStr = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    if (domain) cookieStr += `; domain=${domain}`;
    document.cookie = cookieStr;
  }
}

function getGoogTransCookieValue(): string | null {
  const cookies = document.cookie.split(";");
  let value: string | null = null;
  for (const cookie of cookies) {
    const [name, raw] = cookie.trim().split("=");
    if (name === "googtrans" && raw) {
      // If multiple googtrans cookies exist, prefer the last one.
      value = raw;
    }
  }
  return value;
}

function getGoogleTranslateSelect(): HTMLSelectElement | null {
  return document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
}

function isPageAlreadyTranslated(): boolean {
  return (
    document.documentElement.classList.contains("translated-ltr") ||
    document.documentElement.classList.contains("translated-rtl") ||
    document.body.classList.contains("translated-ltr") ||
    document.body.classList.contains("translated-rtl")
  );
}

function getCurrentTranslatedLang(): string | null {
  const select = getGoogleTranslateSelect();
  if (select && select.value) {
    return select.value;
  }
  return null;
}

function triggerTranslateSelect(langCode: string): boolean {
  const select = getGoogleTranslateSelect();
  if (!select) return false;

  // Google Translate uses empty value to represent original language
  const targetValue = langCode === "en" ? "" : langCode;
  
  // Don't trigger if already set to this value
  if (select.value === targetValue) {
    return true;
  }
  
  select.value = targetValue;
  
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

function scheduleTranslateRetry(langCode: string) {
  if (retryLang !== langCode) {
    retryLang = langCode;
    retryAttempt = 0;
  }

  const delay = RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)];
  retryAttempt += 1;

  if (retryTimer) {
    window.clearTimeout(retryTimer);
    retryTimer = null;
  }

  // Stop retrying after a bounded number of attempts.
  if (retryAttempt > RETRY_DELAYS_MS.length + 2) {
    console.warn("Google Translate widget still not ready; giving up to avoid reload loops");
    retryLang = null;
    retryAttempt = 0;
    return;
  }

  retryTimer = window.setTimeout(() => {
    // Only retry if we still want this language and we haven't already succeeded.
    if (retryLang === langCode && !isPageAlreadyTranslated()) {
      applyGoogleTranslateLanguage(langCode).catch(() => {
        // no-op; retries are best-effort
      });
    }
  }, delay);
}

export async function applyGoogleTranslateLanguage(langCode: string): Promise<void> {
  const target = langCode || "en";

  if (target === "en") {
    // Clear translation cookies
    clearGoogTransCookie();
    document.documentElement.setAttribute("lang", "en");
    lastAppliedLang = "en";
    translationApplied = false;
    
    // Try to reset via the select dropdown
    const widgetReady = await waitForTranslateWidget();
    if (widgetReady) {
      triggerTranslateSelect("en");
      
      // Give it time to revert
      await new Promise(r => setTimeout(r, 300));
    }
    
    // ALWAYS aggressively remove translation classes regardless of widget status
    document.documentElement.classList.remove("translated-ltr", "translated-rtl");
    document.body.classList.remove("translated-ltr", "translated-rtl");
    
    // If page still shows translation after timeout, force reload (with loop prevention)
    setTimeout(() => {
      const stillTranslated = document.documentElement.classList.contains("translated-ltr") ||
                              document.documentElement.classList.contains("translated-rtl");
      if (stillTranslated && !sessionStorage.getItem('gtrans_reset')) {
        sessionStorage.setItem('gtrans_reset', 'true');
        window.location.reload();
      }
    }, 1000);
    
    return;
  }

  // Set the cookie for persistence across page loads
  setGoogTransCookie(`/en/${target}`);

  // Set document language attribute for accessibility
  document.documentElement.setAttribute("lang", target);

  // Wait for widget to be ready, then trigger translation
  const widgetReady = await waitForTranslateWidget(15000);
  if (widgetReady) {
    const currentLang = getCurrentTranslatedLang();
    
    // If switching between non-English languages, first reset to English then apply target
    if (currentLang && currentLang !== "" && currentLang !== target) {
      // Reset to English first
      triggerTranslateSelect("en");
      await new Promise(r => setTimeout(r, 200));
    }
    
    // Now apply the target language
    triggerTranslateSelect(target);
    
    lastAppliedLang = target;
    translationApplied = true;
  } else {
    // Widget not ready — do NOT reload (causes infinite reload loops on cold starts).
    console.warn("Google Translate widget not ready yet; retrying shortly");
    translationApplied = true;
    scheduleTranslateRetry(target);
  }
}

// Check if translation should be applied on page load (from cookie)
// This should only run ONCE on initial load
let cookieCheckDone = false;

export function checkAndApplyTranslationFromCookie(): void {
  // Only run once per page load
  if (cookieCheckDone) {
    return;
  }
  cookieCheckDone = true;
  
  // If page is already translated, don't re-apply
  if (isPageAlreadyTranslated()) {
    // Extract current language from select or cookie and mark as applied
    const select = getGoogleTranslateSelect();
    if (select && select.value) {
      lastAppliedLang = select.value;
      translationApplied = true;
    }
    return;
  }

  const value = getGoogTransCookieValue();
  if (!value) return;

  // Cookie format: /en/targetLang (handles codes like zh-CN, zh-TW)
  const match = value.match(/\/en\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)/);
  if (!match || match[1] === "en") return;

  const targetLang = match[1];
  // Mark as applying to prevent re-triggering
  lastAppliedLang = targetLang;

  // There's a translation cookie, ensure widget is triggered
  waitForTranslateWidget().then((ready) => {
    if (!ready) return;
    const currentLang = getCurrentTranslatedLang();
    // Only trigger if not already on this language
    if (currentLang !== targetLang && !isPageAlreadyTranslated()) {
      triggerTranslateSelect(targetLang);
      translationApplied = true;
    }
  });
}

// Reset the flags (useful for SPA navigation)
export function resetTranslationState(): void {
  translationApplied = false;
  cookieCheckDone = false;
  lastAppliedLang = null;
}
