type Props = {
  logo: string;
  checking: boolean;
  onRetry: () => void;
};

export default function ConnectionView({ logo, checking, onRetry }: Props) {
  return (
    <>
      <img className="logo logo--connection" src={logo} alt="Home Lamp" />
      <h1 className="title">Home Lamp</h1>
      {checking ? (
        <p className="status" role="status">
          Connecting to the lamp…
        </p>
      ) : (
        <>
          <p className="status" role="alert">
            Cannot reach the lamp.
          </p>
          <p className="hint">Join the “Home Lamp” WiFi network, then try again.</p>
          <button type="button" className="button button--primary" onClick={onRetry}>
            Try again
          </button>
        </>
      )}
    </>
  );
}
