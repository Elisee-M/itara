import { useState } from 'react'

type DashboardViewProps = {
  lampOn: boolean
  unreachable: boolean
  onToggle: () => Promise<void>
}

export default function DashboardView({
  lampOn,
  unreachable,
  onToggle,
}: DashboardViewProps) {
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    if (pending) return
    setPending(true)
    await onToggle()
    setPending(false)
  }

  return (
    <section className="dashboard">
      <p className="dashboard__status">
        {lampOn ? 'Lamp is currently ON' : 'Lamp is currently OFF'}
      </p>

      <button
        className="button button--primary dashboard__toggle"
        type="button"
        onClick={() => void handleToggle()}
        disabled={pending}
      >
        {lampOn ? 'Turn OFF' : 'Turn ON'}
      </button>

      {unreachable && (
        <p className="dashboard__notice">
          Lost connection to the lamp. Trying again…
        </p>
      )}
    </section>
  )
}
