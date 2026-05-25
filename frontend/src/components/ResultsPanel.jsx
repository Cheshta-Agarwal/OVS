export default function ResultsPanel({ results, setPage }) {
  return (
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
  )
}
