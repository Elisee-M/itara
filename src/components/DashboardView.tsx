import { useState } from "react";

type Props = {
  logo: string;
  lampOn: boolean;
  unreachable: boolean;
  onToggle: () => Promise<void>;
  onLogout: () => Promise<void>;
  onReboot: () => Promise<void>;
};

export default function DashboardView({
  logo,
  lampOn,
  unreachable,
  onToggle,
  onLogout,
  onReboot,
}: Props) {
  const [pending, setPending] = useState(false);
  const [confirmingRestart, setConfirmingRestart] = useState(false);

  async function run(action: () => Promise<void>) {
    if (pending) return;
    setPending(true);
    try {
      await action();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <img className="logo logo--dashboard" src={logo} alt="Home Lamp" />
      <h1 className="title">Home Lamp</h1>

      {/* Plain text. No background, no border, nothing button-like. */}
      <p className="status" aria-live="polite">
        Lamp is currently {lampOn ? "ON" : "OFF"}
      </p>

      {unreachable && (
        <p className="notice" role="status">
          Lost connection to the lamp. Retrying…
        </p>
      )}

      {/* The ONE toggle button. */}
      <button
        type="button"
        className={`button ${lampOn ? "button--off" : "button--on"}`}
        disabled={pending}
        onClick={() => void run(onToggle)}
      >
        {lampOn ? "Turn OFF" : "Turn ON"}
      </button>

      <div className="secondary">
        {confirmingRestart ? (
          <div className="confirm">
            <p className="hint">Restart the device?</p>
            <div className="confirm__row">
              <button
                type="button"
                className="button button--ghost"
                disabled={pending}
                onClick={() => void run(onReboot)}
              >
                Yes, restart
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirmingRestart(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="confirm__row">
            <button
              type="button"
              className="button button--ghost"
              disabled={pending}
              onClick={() => void run(onLogout)}
            >
              Log out
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setConfirmingRestart(true)}
            >
              Restart device
            </button>
          </div>
        )}
      </div>
    </>
  );
}
