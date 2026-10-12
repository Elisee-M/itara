## Theming (Deep Lagoon)

The app supports two themes: `light` (default) and `lagoon` (dark). A no-flash theme script runs in `<head>` to set the initial theme from localStorage or `prefers-color-scheme`. The choice is persisted in `localStorage` under `home-lamp-theme`. The `ThemeToggle` in the header lets you switch instantly; if the View Transitions API is available, the switch uses a circular reveal expanding from the toggle center, with fallback and `prefers-reduced-motion` respected.

### Usage

```ts
import { useTheme } from './theme/useTheme'
const { theme, toggle } = useTheme()
```

### Customization

Colors live as CSS variables in `src/index.css` (`:root` and `[data-theme="lagoon"]`). Semantic aliases (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-primary`, `--color-accent`, `--color-danger`, `--color-elevated`, `--button-fg`) are exposed so future changes affect the whole UI.

All styles reference these variables. No external fonts, no Tailwind, no network dependencies beyond the device.
