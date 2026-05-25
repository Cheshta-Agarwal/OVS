import React from 'react'
import { Link } from 'react-router-dom'

export default function Header({ token, username, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="brand">
          <div className="brand-logo-container">
            <div className="brand-logo">V</div>
            <div className="indian-flag" title="Proudly Indian">
              <div className="flag-saffron"></div>
              <div className="flag-white">
                <div className="ashoka-chakra"></div>
              </div>
              <div className="flag-green"></div>
            </div>
          </div>
          <div className="brand-text">
            <h1>IndiaVotes</h1>
            <p className="subtitle">Secure • Transparent • Digital Democracy</p>
          </div>
        </Link>
      </div>

      <div className="header-actions">
        {token ? (
          <div className="user-actions">
            <span className="username-badge">Welcome, {username}</span>
            <button onClick={onLogout} className="button button-secondary" title="Sign Out">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <div className="header-badge">E-Voting Portal</div>
        )}
      </div>
    </header>
  )
}
