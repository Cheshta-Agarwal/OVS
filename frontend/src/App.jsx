import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import AuthForm from './components/AuthForm'
import VotePanel from './components/VotePanel'
import ResultsPanel from './components/ResultsPanel'
import { castVote, getCandidates, getResults, loginUser, registerUser, getCurrentUser, setAuthLogoutHandler } from './api'

const initialForm = { username: '', password: '' }

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isBusy, setIsBusy] = useState(false)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const activePath = location.pathname === '/results' ? 'results' : 'vote'

  useEffect(() => {
    loadCandidates()
    loadResults()

    // Register centralized logout handler to run on 401 from API
    setAuthLogoutHandler(() => {
      setStatus({ type: 'error', message: 'Session expired. Please log in again.' })
      setToken('')
      setUsername('')
      setHasVoted(false)
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      navigate('/')
    })

    // If a token exists in localStorage, validate it and fetch user state
    const init = async () => {
      if (token) {
        try {
          const me = await getCurrentUser(token)
          setUsername(me.username)
          setHasVoted(me.has_voted)
          navigate(me.has_voted ? '/results' : '/vote')
        } catch (err) {
          // Token invalid or expired — clear local auth
          setToken('')
          setUsername('')
          localStorage.removeItem('token')
          localStorage.removeItem('username')
        }
      }
      setIsInitializing(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (activePath === 'results' && token) {
      const interval = setInterval(loadResults, 5000)
      return () => clearInterval(interval)
    }
  }, [activePath, token])

  const loadCandidates = async () => {
    setIsLoadingCandidates(true)
    try {
      const data = await getCandidates()
      setCandidates(data)
    } catch (error) {
      setStatus({ type: 'error', message: `Unable to load candidates: ${error.message}` })
    } finally {
      setIsLoadingCandidates(false)
    }
  }

  const loadResults = async () => {
    setIsLoadingResults(true)
    try {
      const data = await getResults()
      setResults(data)
    } catch (error) {
      setStatus({ type: 'error', message: `Unable to load results: ${error.message}` })
    } finally {
      setIsLoadingResults(false)
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

    setIsBusy(true)
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
          navigate(me.has_voted ? '/results' : '/vote')
        } catch (err) {
          setUsername(form.username)
          setHasVoted(false)
          localStorage.setItem('username', form.username)
          navigate('/vote')
        }
        setStatus({ type: 'success', message: 'Login successful. You can now vote.' })
      } else {
        await registerUser(form)
        setAuthMode('login')
        setStatus({ type: 'success', message: 'Registration complete. Please log in.' })
      }
      setForm(initialForm)
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsBusy(false)
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

    setIsBusy(true)
    setStatus({ type: 'loading', message: 'Submitting vote...' })

    try {
      await castVote(token, { candidate_id: selectedCandidate })
      setHasVoted(true)
      setStatus({ type: 'success', message: 'Your vote is recorded. Thank you!' })
      await loadResults()
      navigate('/results')
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsBusy(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setUsername('')
    setHasVoted(false)
    setSelectedCandidate(null)
    setForm(initialForm)
    setStatus({ type: '', message: '' })
    setIsBusy(false)
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <div className="app-shell">
      <Header token={token} username={username} onLogout={handleLogout} />

      <main className="main-panel">
        {isInitializing ? (
          <div className="panel">
            <p className="empty-state">Restoring session and loading your voting data…</p>
          </div>
        ) : (
          <>
            {token && (
              <div className="nav-tabs-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="nav-tabs">
                  <button 
                    onClick={() => navigate('/vote')} 
                    className={`tab-button ${activePath === 'vote' ? 'active' : ''}`}
                  >
                    Ballot
                  </button>
                  <button 
                    onClick={() => navigate('/results')} 
                    className={`tab-button ${activePath === 'results' ? 'active' : ''}`}
                  >
                    Live Results
                  </button>
                </div>
              </div>
            )}
            <Routes>
              <Route
                path="/"
                element={
                  !token ? (
                    <AuthForm
                      authMode={authMode}
                      form={form}
                      onFormChange={handleFormChange}
                      onSubmit={handleAuthSubmit}
                      toggleMode={() => {
                        setAuthMode(authMode === 'login' ? 'register' : 'login')
                        setStatus({ type: '', message: '' })
                      }}
                      disabled={isBusy}
                    />
                  ) : (
                    <Navigate to={hasVoted ? '/results' : '/vote'} replace />
                  )
                }
              />
              <Route
                path="/vote"
                element={
                  token ? (
                    <VotePanel
                      candidates={candidates}
                      selectedCandidate={selectedCandidate}
                      setSelectedCandidate={setSelectedCandidate}
                      handleVote={handleVote}
                      hasVoted={hasVoted}
                      onViewResults={() => navigate('/results')}
                      disabled={isBusy || isLoadingCandidates}
                      isLoading={isLoadingCandidates}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/results"
                element={
                  token ? (
                    <ResultsPanel
                      results={results}
                      onRefresh={loadResults}
                      disabled={isBusy}
                      isLoading={isLoadingResults}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="*"
                element={<Navigate to={token ? (hasVoted ? '/results' : '/vote') : '/'} replace />}
              />
            </Routes>
          </>
        )}

        {status.message && (
          <div className={`status-message ${status.type}`} role="status" aria-live="polite">
            {status.message}
          </div>
        )}
      </main>
      <footer className="site-footer">Built with ♥ for Indian Digital Democracy</footer>
    </div>
  )
}

export default App
