import React from 'react'

export default function AuthForm({ authMode, form, onFormChange, onSubmit, toggleMode, disabled }) {
  return (
    <div className="panel auth-panel">
      <div className="panel-heading" style={{ textAlign: 'center', display: 'block' }}>
        <h2 style={{ fontSize: '2rem' }}>{authMode === 'login' ? 'Voter Sign In' : 'Voter Registration'}</h2>
        <p className="subtitle">
          {authMode === 'login' 
            ? 'Access your secure digital ballot box.' 
            : 'Register your digital identity to participate.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="username">Voter ID / Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={onFormChange}
            disabled={disabled}
            required
            autoComplete="username"
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">Security Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={onFormChange}
            disabled={disabled}
            required
            autoComplete="current-password"
          />
        </div>

        <button className="button button-primary" type="submit" disabled={disabled} style={{ marginTop: '1rem' }}>
          {disabled ? 'Processing...' : authMode === 'login' ? 'Authenticate' : 'Complete Registration'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            type="button" 
            className="tab-button" 
            onClick={toggleMode} 
            disabled={disabled}
            style={{ fontSize: '0.9rem' }}
          >
            {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </form>
      
      <div className="info-box" style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
        <strong>Privacy Assurance:</strong> We use military-grade encryption to protect your credentials and voting history.
      </div>
    </div>
  )
}
