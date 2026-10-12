export type Theme = "light" | "lagoon";

export const THEME_STORAGE_KEY = "home-lamp-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "lagoon";
}

export function resolveInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {}
  try {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) return "lagoon";
  } catch {}
  return "light";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "lagoon") {
    root.setAttribute("data-theme", "lagoon");
  } else {
    root.setAttribute("data-theme", "light");
  }
  try {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "lagoon" ? "#0F1B1E" : "#f7f7f8");
    }
    const metaCS = document.querySelector('meta[name="color-scheme"]');
    if (metaCS) {
      metaCS.setAttribute("content", theme === "lagoon" ? "dark" : "light");
    }
  } catch {}
}
