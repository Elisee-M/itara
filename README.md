# Home Lamp

Mobile-first web app for the ESP32 "Home Lamp" controller. The app is **not**
hosted on the device: it runs as a standalone web app (later wrapped into an
Android APK with Capacitor) and talks to the ESP32 over the local network once
the phone joins the "Home Lamp" WiFi AP.

## Requirements

- Phone joined to the `Home Lamp` WiFi AP (isolated network, no internet).
- Device reachable at `http://192.168.4.1` (plain HTTP, no HTTPS).

## Scripts

```sh
npm install
npm run dev      # local dev server (use a proxy or your LAN IP to test on a phone)
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Configuration

The device host is read at build time and defaults to `http://192.168.4.1`:

```sh
# .env.local
VITE_LAMP_HOST=http://192.168.4.1
```

## API contract

Base URL `http://192.168.4.1`, CORS already enabled, no token or cookie.

| Endpoint  | Method | Body                          | Response                        |
| --------- | ------ | ----------------------------- | ------------------------------- |
| `/api/status` | GET  | –                            | `{ authenticated, lampOn }`     |
| `/api/login`  | POST | `pwd=<string>` (urlencoded) | `{ success }`                   |
| `/api/toggle` | POST | –                            | `{ lampOn }` (401 if not logged in) |
| `/api/logout` | POST | –                            | `{ success }`                   |

`authenticated` is treated as a live flag: the app polls `/api/status` every 4
seconds (paused while the app is hidden, refreshed on resume) and returns to the
login screen as soon as the device reports `false` — including on a 401 from
`/api/toggle`.

## Offline by design

No external fonts, CDNs, analytics or any request outside `192.168.4.1`; system
font stack only. Every network failure (wrong network, device off, malformed
response, 6 s timeout) surfaces as a calm message — never a raw error.

## Project layout

```
src/
  api/lamp.ts              API client for the four endpoints
  assets/home-lamp-logo.png  App logo (transparent background)
  components/Footer.tsx    "Made by Elisee" footer (rendered on every screen)
  components/LoginView.tsx Logo, password field + Unlock button
  components/DashboardView.tsx  Logo, plain-text status + single toggle button
  App.tsx                  Root: status polling and view switching
  index.css / App.css      Mobile-first styles
public/
  favicon.png, icon-192.png, icon-512.png   Icons generated from the logo
```

> The `Made by Elisee` footer in `src/components/Footer.tsx` is a permanent
> requirement — do not remove or hide it.

## Logo

`src/assets/home-lamp-logo.png` is the transparent-background artwork, shown on
the login and dashboard screens. `public/favicon.png` and the `icon-*.png` files
are downscaled copies of it, used by the browser/WebView chrome.

## Wrapping as an Android APK (later)

```sh
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Home Lamp" com.elisee.homelamp --web-dir=dist
npx cap add android && npx cap sync
npx cap open android
```

Launcher icon: Capacitor generates the Android mipmaps from a single square
source. Put a **1024×1024** opaque PNG at `assets/icon.png` before
`npx cap add android` — export it from the full-size original artwork
(`home_lamp_logo.png`, 1254×1254) rather than upscaling the 500×500
transparent version used in the UI.

Note: Android blocks cleartext HTTP by default. The generated
`android/app/src/main/res/xml/network_security_config.xml` only allows
localhost, so add the device before building the APK:

```xml
<domain includeSubdomains="false">192.168.4.1</domain>
```
