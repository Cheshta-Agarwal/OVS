import { useEffect, useState } from 'react'
import './App.css'
import { castVote, getCandidates, getResults, loginUser, registerUser } from './api'

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

  useEffect(() => {
    loadCandidates()
    loadResults()
  }, [])

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
        setUsername(form.username)
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('username', form.username)
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
        <div>
          <p className="eyebrow">Online Voting System</p>
          <h1>Secure vote collection for your team</h1>
          <p className="subtitle">
            React frontend connected to FastAPI backend. Login, vote, and follow results in one dashboard.
          </p>
        </div>
        {token && (
          <div className="header-actions">
            <span>Signed in as <strong>{username}</strong></span>
            <button className="button button-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
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
    </div>
  )
}

export default App
