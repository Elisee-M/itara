import { useCallback, useEffect, useRef, useState } from 'react'
import {
  LampUnreachableError,
  NotAuthenticatedError,
  getStatus,
  login,
  toggleLamp,
} from './api/lamp.ts'
import lampLogo from './assets/home-lamp-logo.png'
import type { LampStatus } from './api/lamp.ts'
import DashboardView from './components/DashboardView.tsx'
import Footer from './components/Footer.tsx'
import LoginView from './components/LoginView.tsx'
import type { UnlockResult } from './components/LoginView.tsx'
import './App.css'

const POLL_INTERVAL_MS = 4000

export default function App() {
  const [status, setStatus] = useState<LampStatus | null>(null)
  const [unreachable, setUnreachable] = useState(false)
  const [checked, setChecked] = useState(false)
  const inFlight = useRef(false)

  const checkStatus = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true

    try {
      setStatus(await getStatus())
      setUnreachable(false)
    } catch {
      setUnreachable(true)
    } finally {
      inFlight.current = false
      setChecked(true)
    }
  }, [])

  const handleUnlock = useCallback(
    async (password: string): Promise<UnlockResult> => {
      try {
        const success = await login(password)
        if (!success) return 'wrong_password'

        setStatus((previous) => ({
          authenticated: true,
          lampOn: previous?.lampOn ?? false,
        }))
        setUnreachable(false)
        void checkStatus()
        return 'ok'
      } catch {
        setUnreachable(true)
        return 'unreachable'
      }
    },
    [checkStatus],
  )

  const handleToggle = useCallback(async () => {
    try {
      const lampOn = await toggleLamp()
      setStatus((previous) => ({
        authenticated: previous?.authenticated ?? true,
        lampOn,
      }))
      setUnreachable(false)
    } catch (error) {
      if (error instanceof NotAuthenticatedError) {
        // The device dropped the session: fall back to the login screen.
        setStatus({ authenticated: false, lampOn: false })
        return
      }

      setUnreachable(true)
      if (error instanceof LampUnreachableError) void checkStatus()
    }
  }, [checkStatus])

  useEffect(() => {
    void checkStatus()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void checkStatus()
    }, POLL_INTERVAL_MS)

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void checkStatus()
    }

    document.addEventListener('visibilitychange', refreshWhenVisible)
    window.addEventListener('focus', refreshWhenVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.removeEventListener('focus', refreshWhenVisible)
    }
  }, [checkStatus])

  const showConnectionScreen = !checked || (unreachable && status === null)

  return (
    <div className="app">
      <main className="app__main">
        {showConnectionScreen ? (
          <section className="connection">
            <img className="logo connection__logo" src={lampLogo} alt="" />
            <p className="connection__text">
              {checked ? 'Cannot reach the lamp.' : 'Connecting to the lamp…'}
            </p>
            <p className="connection__hint">
              Make sure this phone is joined to the Home Lamp WiFi network.
            </p>
            {checked && (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void checkStatus()}
              >
                Try again
              </button>
            )}
          </section>
        ) : status?.authenticated ? (
          <DashboardView
            lampOn={status.lampOn}
            unreachable={unreachable}
            onToggle={handleToggle}
          />
        ) : (
          <LoginView onUnlock={handleUnlock} />
        )}
      </main>
      <Footer />
    </div>
  )
}
