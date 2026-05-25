export default function Header({ token, username, page, setPage, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-logo">OV</div>
        <div>
          <p className="eyebrow">Online Voting Portal</p>
          <h1>Secure vote collection for your team</h1>
          <p className="subtitle">
            Vote with confidence. Track live tallies, and make every ballot count for our community.
          </p>
        </div>
      </div>
      <img className="hero-illustration" src="/election-hero.svg" alt="Election icons" />

      {token ? (
        <div className="header-actions">
          <div className="nav-tabs">
            <button className={`tab-button ${page === 'vote' ? 'active' : ''}`} onClick={() => setPage('vote')}>
              Vote
            </button>
            <button className={`tab-button ${page === 'results' ? 'active' : ''}`} onClick={() => setPage('results')}>
              Results
            </button>
          </div>
          <div className="user-actions">
            <span>Signed in as <strong>{username}</strong></span>
            <button className="button button-secondary button-icon" onClick={onLogout} title="Log out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8v-2a2 2 0 0 0-2-2h-4" />
                <path d="M6 20h4a2 2 0 0 0 2-2v-2" />
                <path d="M10 14l4-4" />
                <path d="M14 14l-4-4" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
