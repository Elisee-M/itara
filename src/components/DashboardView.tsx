type DashboardViewProps = {
  lampOn: boolean
  unreachable: boolean
}

export default function DashboardView({
  lampOn,
  unreachable,
}: DashboardViewProps) {
  return (
    <section className="dashboard">
      <p className="dashboard__status">
        {lampOn ? 'Lamp is currently ON' : 'Lamp is currently OFF'}
      </p>

      {unreachable && (
        <p className="dashboard__notice">
          Lost connection to the lamp. Trying again…
        </p>
      )}
    </section>
  )
}
