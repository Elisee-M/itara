export type LampStatus = {
  authenticated: boolean;
  lampOn: boolean;
};

export class LampUnreachableError extends Error {
  constructor() {
    super("Cannot reach the lamp.");
    this.name = "LampUnreachableError";
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated.");
    this.name = "NotAuthenticatedError";
  }
}

const DEFAULT_HOST = "http://192.168.4.1";
const TIMEOUT_MS = 6000;

// Read at BUILD time. Falls back to the device's fixed AP address.
export const API_BASE: string = (
  (import.meta.env.VITE_LAMP_HOST as string | undefined) || DEFAULT_HOST
).replace(/\/+$/, "");

type Stage = "fetch" | "status" | "body";

// Dev-only diagnostics. Production builds statically drop this call.
// NEVER log the request init: it carries the login password.
function logDiagnostics(url: string, stage: Stage, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const kind =
    err.name === "AbortError"
      ? "timeout"
      : stage === "fetch"
        ? "network"
        : "bad-response";
  console.warn("[lamp] request failed", {
    url,
    stage,
    kind,
    name: err.name,
    message: err.message,
    hint: "Is the phone on the 'Home Lamp' WiFi? Is the page served over https (mixed content)? Is CORS enabled on the device?",
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let stage: Stage = "fetch";
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
    if (response.status === 401) throw new NotAuthenticatedError();
    stage = "status";
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    stage = "body";
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof NotAuthenticatedError) throw error;
    if (import.meta.env.DEV) logDiagnostics(url, stage, error);
    throw new LampUnreachableError();
  } finally {
    clearTimeout(timer);
  }
}

export function getStatus(): Promise<LampStatus> {
  return request<LampStatus>("/api/status");
}

// Returns true when the password was accepted.
export async function login(password: string): Promise<boolean> {
  const result = await request<{ success: boolean }>("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ pwd: password }).toString(),
  });
  return result.success === true;
}

// Returns the new lamp state reported by the device.
export async function toggleLamp(): Promise<boolean> {
  const result = await request<{ lampOn: boolean }>("/api/toggle", {
    method: "POST",
  });
  return result.lampOn;
}

export async function logout(): Promise<void> {
  await request<{ success: boolean }>("/api/logout", { method: "POST" });
}

export async function rebootDevice(): Promise<void> {
  await request<{ restarting: boolean }>("/api/reboot", { method: "POST" });
}
