import { useCallback, useEffect, useRef, useState } from "react";
import logo from "./assets/home-lamp-logo.png";
import {
  getStatus,
  login,
  logout,
  rebootDevice,
  toggleLamp,
  NotAuthenticatedError,
} from "./api/lamp.ts";
import type { LampStatus } from "./api/lamp.ts";
import ConnectionView from "./components/ConnectionView.tsx";
import DashboardView from "./components/DashboardView.tsx";
import Footer from "./components/Footer.tsx";
import LoginView from "./components/LoginView.tsx";
import type { UnlockResult } from "./components/LoginView.tsx";
import ThemeToggle from "./components/ThemeToggle.tsx";
import { useThemeWithTransition } from "./theme/useThemeTransition.ts";
import "./App.css";

const POLL_MS = 4000;

export default function App() {
  const [status, setStatus] = useState<LampStatus | null>(null);
  const [unreachable, setUnreachable] = useState(false);
  const [checked, setChecked] = useState(false);
  const inFlight = useRef(false);
  const { toggleWithTransition } = useThemeWithTransition();

  const checkStatus = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const next = await getStatus();
      setStatus(next);
      setUnreachable(false);
    } catch {
      setUnreachable(true);
    } finally {
      inFlight.current = false;
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    void checkStatus();
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") void checkStatus();
    };
    const timer = window.setInterval(refreshIfVisible, POLL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, [checkStatus]);

  const handleUnlock = async (password: string): Promise<UnlockResult> => {
    try {
      const ok = await login(password);
      if (!ok) return "wrong";
      setStatus((prev) => ({ lampOn: prev?.lampOn ?? false, authenticated: true }));
      setUnreachable(false);
      void checkStatus();
      return "ok";
    } catch {
      return "unreachable";
    }
  };

  const handleToggle = async (): Promise<void> => {
    try {
      const lampOn = await toggleLamp();
      setStatus({ authenticated: true, lampOn });
      setUnreachable(false);
    } catch (error) {
      if (error instanceof NotAuthenticatedError) {
        setStatus((prev) => (prev ? { ...prev, authenticated: false } : prev));
      } else {
        setUnreachable(true);
      }
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch {
      // Even if the request fails, leave the dashboard locally.
    }
    setStatus((prev) => (prev ? { ...prev, authenticated: false } : prev));
  };

  const handleReboot = async (): Promise<void> => {
    try {
      await rebootDevice();
    } catch {
      // The device may drop before it replies. That is expected.
    }
    setStatus((prev) => (prev ? { ...prev, authenticated: false } : prev));
  };

  const showConnectionScreen = !checked || (unreachable && status === null);

  let view;
  if (showConnectionScreen) {
    view = <ConnectionView logo={logo} checking={!checked} onRetry={() => void checkStatus()} />;
  } else if (status?.authenticated) {
    view = (
      <DashboardView
        logo={logo}
        lampOn={status.lampOn}
        unreachable={unreachable}
        onToggle={handleToggle}
        onLogout={handleLogout}
        onReboot={handleReboot}
      />
    );
  } else {
    view = <LoginView logo={logo} onUnlock={handleUnlock} />;
  }

  return (
    <div className="app">
      <header className="app__header">
        <ThemeToggle onToggle={toggleWithTransition} />
      </header>
      <main className="content">{view}</main>
      <Footer />
    </div>
  );
}
