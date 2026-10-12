import { useCallback } from "react";
import type { Theme } from "../theme/theme.ts";
import { applyTheme, isTheme, THEME_STORAGE_KEY } from "../theme/theme.ts";

export function useThemeWithTransition() {
  const readTheme = useCallback((): Theme => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(stored)) return stored;
    } catch {}
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "lagoon";
    } catch {}
    return "light";
  }, []);

  const toggleWithTransition = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const btn = event.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const current = readTheme();
      const next: Theme = current === "light" ? "lagoon" : "light";
      const root = document.documentElement;
      const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced || typeof document.startViewTransition !== "function") {
        applyTheme(next);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {}
        return;
      }
      const maxR = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.style.setProperty("--view-transition-x", x + "px");
      root.style.setProperty("--view-transition-y", y + "px");
      root.style.setProperty("--view-transition-radius", maxR + "px");
      document.startViewTransition(() => {
        applyTheme(next);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {}
      });
    },
    [readTheme]
  );

  return { toggleWithTransition, readTheme } as const;
}
