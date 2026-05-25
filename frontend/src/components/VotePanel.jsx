import React from 'react'

export default function VotePanel({ candidates, selectedCandidate, setSelectedCandidate, handleVote, hasVoted, onViewResults, disabled, isLoading }) {
  return (
    <div className="panel vote-panel">
      <div className="panel-heading">
        <div>
          <h2>Electronic Ballot Box</h2>
          <p className="subtitle">Select your preferred candidate to cast your secure vote.</p>
        </div>
        {hasVoted && (
          <button className="button button-secondary" onClick={onViewResults}>
            Live Results Dashboard
          </button>
        )}
      </div>

      {hasVoted && (
        <div className="info-box success" style={{ marginBottom: '2rem' }}>
          <strong>✓ Vote Confirmed:</strong> Your ballot has been securely cast and recorded.
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <p>Retrieving candidate list...</p>
        </div>
      ) : candidates.length === 0 ? (
        <p className="empty-state">No candidates are registered for this election yet.</p>
      ) : (
        <div className="candidate-grid">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className={`candidate-card ${selectedCandidate === cand.id ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
              onClick={() => !disabled && !hasVoted && setSelectedCandidate(cand.id)}
            >
              <div className="radio-custom"></div>
              <div className="candidate-info">
                <h3>{cand.name}</h3>
                <span className="candidate-party">{cand.party}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasVoted && (
        <div className="panel-actions" style={{ marginTop: '2.5rem' }}>
          <button
            className="button button-primary"
            onClick={handleVote}
            disabled={disabled || !selectedCandidate}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            {disabled ? 'Processing...' : 'Submit My Ballot Official'}
          </button>
        </div>
      )}
      
      <div className="info-box" style={{ marginTop: '2.5rem', background: 'rgba(51, 65, 85, 0.05)', color: '#475569', border: 'none' }}>
        <strong>Digital Security:</strong> This platform uses end-to-end encryption to ensure your vote remains private and untraceable.
      </div>
    </div>
  )
}
