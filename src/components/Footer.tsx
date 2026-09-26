const PORTFOLIO_URL = 'https://elisee.vercel.app/'

export default function Footer() {
  return (
    <footer className="app__footer">
      <p className="app__credit">Made by Elisee</p>
      <a
        className="app__portfolio"
        href={PORTFOLIO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Portfolio (opens outside the app)"
      >
        Portfolio
      </a>
    </footer>
  )
}
