export default function VotePanel({ candidates, selectedCandidate, setSelectedCandidate, handleVote, hasVoted, setPage }) {
  return (
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
  )
}
