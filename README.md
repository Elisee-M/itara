# Home Lamp

Mobile-first web app for the ESP32 **Home Lamp** controller. It is **not** hosted
on the device: it is a standalone React app, bundled locally and wrapped into an
Android APK with Capacitor, that talks to the ESP32 over the local WiFi access
point.

The device boots as an open WiFi AP named `Home Lamp` (no password) and is always
reachable at `http://192.168.4.1` over plain HTTP with CORS enabled. The phone
joins that network, opens the app, enters the lamp password, and toggles the lamp.

## Requirements

- Node.js 20+ and npm.
- A phone (or the Android emulator) joined to the `Home Lamp` WiFi AP. That
  network has no internet, by design.
- The ESP32 lamp reachable at `http://192.168.4.1`.
- For the APK: JDK 21 and the Android SDK.

## npm scripts

```sh
npm install      # install dependencies
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build -> writes dist/
npm run lint     # oxlint src
npm run preview  # serve the built dist/
```

## Configuration

The device host is read at **build time** and defaults to `http://192.168.4.1`.
Override it for a different address (for example a bench device on your LAN)
with a `.env.local` file:

```sh
# .env.local
VITE_LAMP_HOST=http://192.168.4.1
```

The value is trimmed and any trailing slashes are removed. Nothing else in the
app can be configured: there are no runtime settings and no remote config.

## Device API contract

Base URL `http://192.168.4.1`, plain HTTP, CORS enabled, no token and no cookie.
"Authenticated" is a single flag stored on the device, shared by every phone; it
resets to `false` when the device reboots.

| Method | Path          | Request body                     | Success response                    | Notes                                        |
| ------ | ------------- | -------------------------------- | ----------------------------------- | -------------------------------------------- |
| GET    | `/api/status` | none                             | `{"authenticated":bool,"lampOn":bool}` | Polled by the app                         |
| POST   | `/api/login`  | `pwd=<password>` (urlencoded)    | `{"success":bool}`                  | Always HTTP 200; wrong password → `false`    |
| POST   | `/api/toggle` | none                             | `{"lampOn":bool}`                   | HTTP 401 `{"error":"not_authenticated"}`     |
| POST   | `/api/logout` | none                             | `{"success":true}`                  |                                              |
| POST   | `/api/reboot` | none                             | `{"restarting":true}`               | HTTP 401 if not logged in; device restarts   |

`GET /api/status` is the source of truth: the app shows the login screen whenever
it reports `authenticated: false`, and it polls every 4 seconds while the page is
visible (plus on `visibilitychange` and window `focus`). Status requests never
overlap. A `401` from `/api/toggle` drops the app back to the login screen.

## Offline by design

The phone is on an isolated network with no internet, so the app makes **zero
requests to anything except the device**. All network I/O lives in
`src/api/lamp.ts`. There are no external fonts (system font stack only), no CDNs,
no analytics and no remote images. Every network failure — wrong network, device
off, malformed response, 6-second timeout — is turned into a calm, human message,
never a raw error string. The password is never logged and never hard-coded.

## Project layout

```
index.html                    HTML entry point (mobile viewport, theme color, icons)
src/
  main.tsx                    React entry point
  App.tsx                     Root: status polling, reboot/logout, view switching
  index.css                   Design tokens, reset, global styles
  App.css                     Mobile layout, safe-area padding, components
  api/lamp.ts                 The only file that performs network I/O
  assets/home-lamp-logo.png   500x500 transparent logo used in the UI
  components/
    ConnectionView.tsx        "Connecting…" / "Cannot reach the lamp." + Try again
    LoginView.tsx             Logo, password field, Unlock button
    DashboardView.tsx         Plain-text status, one toggle button, quiet actions
    Footer.tsx                "Made by Elisee" + Portfolio link (every screen)
public/
  favicon.png icon-192.png icon-512.png   Icons for the browser / WebView chrome
```

The "Made by Elisee" credit in `src/components/Footer.tsx` is a **permanent
requirement** and appears at the bottom of every screen. Do not remove or hide it.

## Wrapping as an Android APK

```sh
npm run build
npx cap add android      # first time only
npx cap sync android
```

Capacitor must serve the app over `http://localhost` (not `https://`), because an
https page is not allowed to call `http://192.168.4.1` (mixed content). This is
already configured in `capacitor.config.ts` (`server.androidScheme: "http"`,
`cleartext: true`, `android.allowMixedContent: true`).

Android also blocks cleartext HTTP by default, so
`android/app/src/main/res/xml/network_security_config.xml` allows `192.168.4.1`,
and the `<application>` tag in
`android/app/src/main/AndroidManifest.xml` references it via
`android:networkSecurityConfig="@xml/network_security_config"`.

### Build the debug APK (Windows)

The developer's Windows username contains a special character that breaks
Gradle's cache path, so set a clean cache directory first:

```bat
setx GRADLE_USER_HOME "C:\gradle-home"
```

The Android SDK lives in `C:\Android` (JDK 21). Create `android\local.properties`:

```
sdk.dir=C:/Android
```

Then:

```bat
npm run build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

Output: `android\app\build\outputs\apk\debug\app-debug.apk`.

## Known limitations

- The wall switch inside the house switches the lamp electrically; the ESP32
  cannot see it, so the app shows the **last state the ESP32 commanded**. It can
  be out of sync if someone used the wall switch. This is not fixable in the UI.
- Login is one shared flag on the device, not per-phone.
- A copy hosted over HTTPS cannot control the lamp: browsers block an https page
  from calling `http://192.168.4.1`, and the phone has no internet while joined
  to the lamp's WiFi. The deliverable is the locally bundled APK. A hosted copy
  is only a visual preview.
- Android may route traffic over mobile data when the connected WiFi has no
  internet. If the app cannot reach the lamp, tap "Stay connected" on Android's
  no-internet prompt, or turn mobile data off while using the app.
