import { useCallback, useEffect, useState } from "react";
import type { Theme } from "./theme.ts";
import { applyTheme, isTheme, resolveInitialTheme, THEME_STORAGE_KEY } from "./theme.ts";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "lagoon" : "light"));
  }, []);

  return { theme, toggle, setTheme: setThemeState } as const;
}
