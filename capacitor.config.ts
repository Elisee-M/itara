import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.elisee.homelamp", // choose deliberately: hard to change later
  appName: "Home Lamp",
  webDir: "dist",
  server: {
    // Serve the app from http://localhost instead of https://localhost.
    // An https page is NOT allowed to call http://192.168.4.1 (mixed content).
    androidScheme: "http",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
