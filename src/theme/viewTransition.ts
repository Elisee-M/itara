export function getMaxRadius(x: number, y: number, width: number, height: number): number {
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

export function applyThemeWithTransition(theme: "light" | "lagoon", toggleX?: number, toggleY?: number): void {
  const root = document.documentElement;
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || typeof document.startViewTransition !== "function" || toggleX === undefined || toggleY === undefined) {
    root.setAttribute("data-theme", theme);
    return;
  }
  const rect = { x: toggleX, y: toggleY, w: window.innerWidth, h: window.innerHeight };
  const maxR = getMaxRadius(rect.x, rect.y, rect.w, rect.h);
  document.documentElement.style.setProperty("--view-transition-x", rect.x + "px");
  document.documentElement.style.setProperty("--view-transition-y", rect.y + "px");
  document.documentElement.style.setProperty("--view-transition-radius", maxR + "px");
  document.startViewTransition(() => {
    root.setAttribute("data-theme", theme);
  });
}
