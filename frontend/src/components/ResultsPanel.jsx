export default function ResultsPanel({ results, setPage, onRefresh, disabled }) {
  const totalVotes = results.reduce((sum, item) => sum + item.vote_count, 0)

  return (
    <aside className="panel results-panel">
      <div className="panel-heading">
        <h2>Live results</h2>
        <button className="button button-link" onClick={onRefresh} type="button" disabled={disabled}>
          Refresh results
        </button>
      </div>

      {results.length > 0 && (
        <div className="summary-card">
          <span>Total votes cast</span>
          <strong>{totalVotes}</strong>
        </div>
      )}

      <div className="results-list">
        {results.length === 0 ? (
          <p className="empty-state">Results will appear after voting begins.</p>
        ) : (
          results.map((item) => {
            const percent = totalVotes ? Math.round((item.vote_count / totalVotes) * 100) : 0
            return (
              <div key={item.id} className="result-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.party}</span>
                </div>
                <div className="result-meta">
                  <span>{item.vote_count} votes · {percent}%</span>
                  <div className="result-bar-bg">
                    <div
                      className="result-bar"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
