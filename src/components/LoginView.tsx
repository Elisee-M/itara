export type UnlockResult = "ok" | "wrong" | "unreachable";

type Props = {
  logo: string;
  onUnlock: (password: string) => Promise<UnlockResult>;
};

export default function LoginView({ logo, onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const result = await onUnlock(password);
    setPending(false);
    if (result === "wrong") {
      setError("That password did not work.");
    } else if (result === "unreachable") {
      setError("Cannot reach the lamp. Check that you are on the Home Lamp network.");
    }
  }

  return (
    <>
      <img className="logo logo--login" src={logo} alt="Home Lamp" />
      <h1 className="title">Home Lamp</h1>
      <form className="login-form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="off"
            required
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button--primary" disabled={pending}>
          {pending ? "Unlocking…" : "Unlock"}
        </button>
      </form>
    </>
  );
}
