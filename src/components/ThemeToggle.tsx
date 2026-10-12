import { useEffect, useState } from "react";
import { isTheme, THEME_STORAGE_KEY } from "../theme/theme.ts";

export default function ThemeToggle({ onToggle }: { onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const [theme, setTheme] = useState<"light" | "lagoon">(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(stored)) return stored;
    } catch {}
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "lagoon";
    } catch {}
    return "light";
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && isTheme(e.newValue)) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isLagoon = theme === "lagoon";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isLagoon ? "Switch to light theme" : "Switch to lagoon theme"}
      aria-pressed={isLagoon}
      title={isLagoon ? "Switch to light theme" : "Switch to lagoon theme"}
    >
      <svg
        className="theme-toggle__icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isLagoon ? (
          <g>
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="M4.93 4.93l1.41 1.41"></path>
            <path d="M17.66 17.66l1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="M6.34 17.66l-1.41 1.41"></path>
            <path d="M19.07 4.93l-1.41 1.41"></path>
          </g>
        ) : (
          <g>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </g>
        )}
      </svg>
      <span className="theme-toggle__label">{isLagoon ? "Light" : "Lagoon"}</span>
    </button>
  );
}
