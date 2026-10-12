# Deep Lagoon theme audit

Stack:
- React 19 + TypeScript + Vite 8, oxlint. No Tailwind. No router. One-column app with three views (Connection/Login/Dashboard) and a Footer. Capacitor (Android).

Theme logic:
- None currently. Only CSS custom properties in `src/index.css`. No `[data-theme]` variants, no theme state, no persistence, no no-flash script, no View Transitions. Static `<meta name="theme-color">`.

Hardcoded colors found:
- index.css L2-9: 8 hex tokens (light only). L15: `color-scheme: light`. L56: focus ring uses `--primary`.
- App.css L66: `.button { color: #fff; }` (pure white).
- index.html L10: `<meta name="theme-color" content="#f7f7f8">`.

No Tailwind utilities, no `dark:` classes, no inline styles, no SVGs, no gradients, no shadows, no hsl/rgb outside the existing hex tokens. The app logo is a transparent PNG (`src/assets/home-lamp-logo.png`) that must be checked against the lagoon background (#0F1B1E).

Design decisions (based on answers):
- No Tailwind. Expose semantic tokens as CSS variables on `:root` and `[data-theme="lagoon"]`.
- Light palette unchanged (map to existing brand colors). Add semantic aliases.
- Lagoon mapping: primary/gold (#E8A64C) for primary actions (Unlock/Try again/focus), teal (#5FB8A8) for "Turn ON", warm red (#E07A6B) for "Turn OFF". Backgrounds #0F1B1E/#162428/#1D2F34, borders #2A4047, text #E6E2D6, muted #9BAFB0.
- Theme toggle in a slim top-right header (app shell). No-flash script in <head>, `color-scheme` flips per theme, theme-color updates on change, localStorage persistence, prefers-color-scheme initial. View Transitions circular reveal + fallback + reduced-motion.
