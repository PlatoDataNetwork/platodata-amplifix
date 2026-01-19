function setGoogTransCookie(value: string) {
  // Both variants help across different hosting / subdomain setups
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
}

function triggerTranslateSelect(langCode: string) {
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (!select) return false;

  // Google Translate uses empty value to represent the original language
  select.value = langCode === "en" ? "" : langCode;
  select.dispatchEvent(new Event("change"));
  return true;
}

export function applyGoogleTranslateLanguage(langCode: string) {
  const target = langCode || "en";

  // Setting the cookie makes Google Translate keep state across refreshes.
  setGoogTransCookie(target === "en" ? "/en/en" : `/en/${target}`);

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
