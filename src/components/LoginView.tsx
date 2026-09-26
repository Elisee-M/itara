import { useState } from 'react'
import type { FormEvent } from 'react'
import lampLogo from '../assets/home-lamp-logo.png'

export type UnlockResult = 'ok' | 'wrong_password' | 'unreachable'

type LoginViewProps = {
  onUnlock: (password: string) => Promise<UnlockResult>
}

export default function LoginView({ onUnlock }: LoginViewProps) {
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<UnlockResult | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setPending(true)
    setError(null)

    const result = await onUnlock(password)
    if (result === 'ok') {
      setPassword('')
    } else {
      setError(result)
    }

    setPending(false)
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <img className="logo login__logo" src={lampLogo} alt="" />
      <h1 className="login__title">Home Lamp</h1>

      <label className="login__label" htmlFor="lamp-password">
        Password
      </label>
      <input
        id="lamp-password"
        className="login__input"
        type="password"
        name="password"
        value={password}
        autoComplete="current-password"
        enterKeyHint="go"
        autoFocus
        disabled={pending}
        onChange={(event) => setPassword(event.target.value)}
      />

      {error !== null && (
        <p className="login__error" role="alert">
          {error === 'wrong_password'
            ? 'That password did not work.'
            : 'Cannot reach the lamp. Check that you are on the Home Lamp network.'}
        </p>
      )}

      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? 'Unlocking…' : 'Unlock'}
      </button>
    </form>
  )
}
