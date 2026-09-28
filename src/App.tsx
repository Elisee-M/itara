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
const IDLE_POLL_INTERVAL_MS = 15000

export default function App() {
  const [status, setStatus] = useState<LampStatus | null>(null)
  const [unreachable, setUnreachable] = useState(false)
  const [checked, setChecked] = useState(false)
  const inFlight = useRef(false)
  const mutationInFlight = useRef(false)
  const revision = useRef(0)
  const timer = useRef<number | null>(null)

  const authenticated = status?.authenticated === true

  const checkStatus = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    const startedAt = revision.current

    try {
      const next = await getStatus()
      // A toggle or a login landed while this request was in the air: that
      // answer is newer than ours, so drop it instead of clobbering it.
      if (revision.current !== startedAt) return
      setStatus(next)
      setUnreachable(false)
    } catch {
      if (revision.current !== startedAt) return
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

        revision.current += 1
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
    if (mutationInFlight.current) return
    mutationInFlight.current = true

    try {
      const lampOn = await toggleLamp()
      revision.current += 1
      setStatus((previous) => ({
        authenticated: previous?.authenticated ?? true,
        lampOn,
      }))
      setUnreachable(false)
    } catch (error) {
      if (error instanceof NotAuthenticatedError) {
        // The device dropped the session: fall back to the login screen.
        revision.current += 1
        setStatus({ authenticated: false, lampOn: false })
        return
      }

      setUnreachable(true)
      if (error instanceof LampUnreachableError) void checkStatus()
    } finally {
      mutationInFlight.current = false
    }
  }, [checkStatus])

  useEffect(() => {
    // On the login screen there is nothing to keep in sync but reachability, so
    // poll slowly there and keep the 4s cadence only while a session is open.
    const interval = authenticated ? POLL_INTERVAL_MS : IDLE_POLL_INTERVAL_MS
    let cancelled = false

    const schedule = () => {
      if (cancelled) return
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(run, interval)
    }

    // Self-scheduling: the next request only goes out once the previous one has
    // settled, so a slow device can never stack requests on top of each other.
    const run = async () => {
      if (cancelled) return
      if (document.visibilityState === 'visible') await checkStatus()
      schedule()
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState !== 'visible') return
      void checkStatus()
      schedule()
    }

    void run()

    document.addEventListener('visibilitychange', refreshWhenVisible)
    window.addEventListener('focus', refreshWhenVisible)

    return () => {
      cancelled = true
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = null
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.removeEventListener('focus', refreshWhenVisible)
    }
  }, [authenticated, checkStatus])

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
