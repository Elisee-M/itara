import { useState } from 'react'
import lampLogo from '../assets/home-lamp-logo.png'

type DashboardViewProps = {
  lampOn: boolean
  unreachable: boolean
  onToggle: () => Promise<void>
  onLogout: () => Promise<void>
}

export default function DashboardView({
  lampOn,
  unreachable,
  onToggle,
  onLogout,
}: DashboardViewProps) {
  const [toggling, setToggling] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const busy = toggling || loggingOut

  async function handleToggle() {
    if (busy) return
    setToggling(true)
    try {
      await onToggle()
    } finally {
      setToggling(false)
    }
  }

  async function handleLogout() {
    if (busy) return
    setLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <section className="dashboard">
      <img className="logo dashboard__logo" src={lampLogo} alt="" />

      <p className="dashboard__status">
        {lampOn ? 'Lamp is currently ON' : 'Lamp is currently OFF'}
      </p>

      <button
        className="button button--primary dashboard__toggle"
        type="button"
        onClick={() => void handleToggle()}
        disabled={busy}
      >
        {toggling ? 'Switching…' : lampOn ? 'Turn OFF' : 'Turn ON'}
      </button>

      {unreachable && (
        <p className="dashboard__notice">
          Lost connection to the lamp. Trying again…
        </p>
      )}

      <button
        className="button button--secondary dashboard__logout"
        type="button"
        onClick={() => void handleLogout()}
        disabled={busy}
      >
        {loggingOut ? 'Logging out…' : 'Log out'}
      </button>
    </section>
  )
}
