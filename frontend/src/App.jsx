import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import AuthForm from './components/AuthForm'
import VotePanel from './components/VotePanel'
import ResultsPanel from './components/ResultsPanel'
import { castVote, getCandidates, getResults, loginUser, registerUser, getCurrentUser, setAuthLogoutHandler } from './api'

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

    // Register centralized logout handler to run on 401 from API
    setAuthLogoutHandler(() => {
      setStatus({ type: 'error', message: 'Session expired. Please log in again.' })
      setToken('')
      setUsername('')
      setPage('auth')
      setHasVoted(false)
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    })

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
      <Header token={token} username={username} page={page} setPage={setPage} onLogout={handleLogout} />

      <main className="main-panel">
        {!token ? (
          <AuthForm
            authMode={authMode}
            form={form}
            onFormChange={handleFormChange}
            onSubmit={handleAuthSubmit}
            toggleMode={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login')
              setStatus({ type: '', message: '' })
            }}
          />
        ) : (
          <section className="dashboard-grid">
            <VotePanel
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              setSelectedCandidate={setSelectedCandidate}
              handleVote={handleVote}
              hasVoted={hasVoted}
              setPage={setPage}
            />
            <ResultsPanel results={results} setPage={setPage} />
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
