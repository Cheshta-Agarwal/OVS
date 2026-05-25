import { useEffect, useState } from 'react'
import './App.css'
import { castVote, getCandidates, getResults, loginUser, registerUser, getCurrentUser } from './api'

const initialForm = { username: '', password: '' }

function App() {
  const [page, setPage] = useState('auth')
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const totalVotes = results.reduce((sum, item) => sum + (item.vote_count || 0), 0)
  const maxVotes = Math.max(...results.map((item) => item.vote_count || 0), 1)

  useEffect(() => {
    loadCandidates()
    loadResults()
    // If a token exists in localStorage, validate it and fetch user state
    const init = async () => {
      if (token) {
        try {
          const me = await getCurrentUser(token)
          setUsername(me.username)
          setHasVoted(me.has_voted)
          setPage('vote')
        } catch (err) {
          // Token invalid or expired — clear local auth
          setToken('')
          setUsername('')
          localStorage.removeItem('token')
          localStorage.removeItem('username')
        }
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (token && page === 'auth') {
      setPage('vote')
    }
  }, [token, page])

  useEffect(() => {
    if (page === 'results' && token) {
      const interval = setInterval(loadResults, 5000)
      return () => clearInterval(interval)
    }
  }, [page, token])

  const loadCandidates = async () => {
    try {
      const data = await getCandidates()
      setCandidates(data)
    } catch (error) {
      setStatus({ type: 'error', message: `Unable to load candidates: ${error.message}` })
    }
  }

  const loadResults = async () => {
    try {
      const data = await getResults()
      setResults(data)
    } catch (error) {
      console.error('Results error', error)
    }
  }

  const handleFormChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    if (!form.username || !form.password) {
      setStatus({ type: 'error', message: 'Username and password are required.' })
      return
    }

    setStatus({ type: 'loading', message: authMode === 'login' ? 'Signing in...' : 'Creating account...' })

    try {
      if (authMode === 'login') {
        const data = await loginUser(form)
        setToken(data.access_token)
        localStorage.setItem('token', data.access_token)
        // Fetch current user to get authoritative `has_voted` and username
        try {
          const me = await getCurrentUser(data.access_token)
          setUsername(me.username)
          setHasVoted(me.has_voted)
          localStorage.setItem('username', me.username)
        } catch (err) {
          // Fallback to form username if /me fails
          setUsername(form.username)
          localStorage.setItem('username', form.username)
        }
        setPage('vote')
        setStatus({ type: 'success', message: 'Login successful. You can now vote.' })
      } else {
        await registerUser(form)
        setAuthMode('login')
        setStatus({ type: 'success', message: 'Registration complete. Please log in.' })
      }
      setForm(initialForm)
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    }
  }

  const handleVote = async () => {
    if (!selectedCandidate) {
      setStatus({ type: 'error', message: 'Please choose a candidate first.' })
      return
    }
    if (!token) {
      setStatus({ type: 'error', message: 'Login needed before voting.' })
      return
    }

    setStatus({ type: 'loading', message: 'Submitting vote...' })

    try {
      await castVote(token, { candidate_id: selectedCandidate })
      setHasVoted(true)
      setStatus({ type: 'success', message: 'Your vote is recorded. Thank you!' })
      loadResults()
      setPage('results')
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    }
  }

  const handleLogout = () => {
    setToken('')
    setUsername('')
    setPage('auth')
    setHasVoted(false)
    setSelectedCandidate(null)
    setForm(initialForm)
    setStatus({ type: '', message: '' })
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  return (
    <div className="app-shell">
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
              <button
                className={`tab-button ${page === 'vote' ? 'active' : ''}`}
                onClick={() => setPage('vote')}
              >
                Vote
              </button>
              <button
                className={`tab-button ${page === 'results' ? 'active' : ''}`}
                onClick={() => setPage('results')}
              >
                Results
              </button>
            </div>
            <div className="user-actions">
              <span>Signed in as <strong>{username}</strong></span>
              <button className="button button-secondary button-icon" onClick={handleLogout} title="Log out">
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

      <main className="main-panel">
        {!token ? (
          <section className="auth-panel">
            <div className="panel-heading">
              <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <button
                className="button button-link"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                  setStatus({ type: '', message: '' })
                }}
              >
                {authMode === 'login' ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <label>
                Username
                <input
                  name="username"
                  value={form.username}
                  onChange={handleFormChange}
                  placeholder="username"
                  autoComplete="username"
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder="password"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>

              <button className="button button-primary" type="submit">
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </section>
        ) : (
          <section className="dashboard-grid">
            <div className="panel vote-panel">
              <div className="panel-heading">
                <h2>Choose your candidate</h2>
                <button className="button button-link" onClick={() => setPage('results')}>
                  View results
                </button>
              </div>

              {hasVoted && (
                <div className="info-box">
                  You have voted already. Results will update automatically.
                </div>
              )}

              {candidates.length === 0 ? (
                <p className="empty-state">No candidates available yet.</p>
              ) : (
                <div className="candidate-list">
                  {candidates.map((candidate) => (
                    <label key={candidate.id} className={`candidate-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate.id}
                        checked={selectedCandidate === candidate.id}
                        onChange={() => setSelectedCandidate(candidate.id)}
                      />
                      <div>
                        <strong>{candidate.name}</strong>
                        <span>{candidate.party}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button className="button button-primary" onClick={handleVote} disabled={!selectedCandidate || hasVoted}>
                {hasVoted ? 'Vote recorded' : 'Submit vote'}
              </button>
            </div>

            <aside className="panel results-panel">
              <div className="panel-heading">
                <h2>Live results</h2>
                <button className="button button-link" onClick={() => setPage('results')}>
                  Refresh results
                </button>
              </div>
              <div className="results-list">
                {results.length === 0 ? (
                  <p className="empty-state">Results will appear after voting begins.</p>
                ) : (
                  results.map((item) => (
                    <div key={item.id} className="result-row">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.party}</span>
                      </div>
                      <div className="result-meta">
                        <span>{item.vote_count} votes</span>
                        <div className="result-bar-bg">
                          <div
                            className="result-bar"
                            style={{ width: `${Math.min(100, item.vote_count * 10)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </section>
        )}

        {status.message && (
          <div className={`status-message ${status.type}`}>{status.message}</div>
        )}
      </main>
      <footer className="site-footer">Built with ♥ — Online Voting System</footer>
    </div>
  )
}

export default App
