import React from 'react'
import ResultsChart from './ResultsChart'

export default function ResultsPanel({ results, onRefresh, disabled, isLoading }) {
  const totalVotes = results.reduce((sum, r) => sum + (r.vote_count || 0), 0)
  const topCandidate = results.length > 0 
    ? [...results].sort((a, b) => b.vote_count - a.vote_count)[0] 
    : null

  return (
    <div className="panel results-panel">
      <div className="panel-heading">
        <div>
          <h2>Election Live Dashboard</h2>
          <p className="subtitle">Real-time tally of all cast ballots nationwide.</p>
        </div>
        <button 
          className="button button-secondary" 
          onClick={onRefresh} 
          disabled={disabled || isLoading}
        >
          {isLoading ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="metric-card panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Ballots Cast</span>
          <strong style={{ display: 'block', fontSize: '2rem', marginTop: '0.5rem', color: 'var(--primary)' }}>{totalVotes}</strong>
        </div>
        <div className="metric-card panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>Current Leader</span>
          <strong style={{ display: 'block', fontSize: '1.5rem', marginTop: '0.5rem' }}>
            {topCandidate ? topCandidate.name : 'N/A'}
          </strong>
        </div>
        <div className="metric-card panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</span>
          <strong style={{ display: 'block', fontSize: '1.2rem', marginTop: '0.5rem', color: 'var(--success)' }}>ACTIVE</strong>
        </div>
      </div>

      <div className="chart-section" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center' }}>
        <ResultsChart results={results} />
      </div>

      <div className="info-box" style={{ marginTop: '3rem', background: 'rgba(51, 65, 85, 0.03)', color: '#64748b', border: 'none' }}>
        <strong>Dashboard sync:</strong> These results are automatically synchronized with the national database every 5 seconds.
      </div>
    </div>
  )
}
