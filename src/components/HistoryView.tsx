import { loadHistory, clearHistory } from '../utils/storage'

interface HistoryViewProps {
  onBack: () => void
  onRunNew: () => void
}

function scoreBg(s: number): string {
  if (s < 35) return '#1a2e05'
  if (s < 65) return '#3b2200'
  return '#450a0a'
}

function scoreColor(s: number): string {
  if (s < 35) return '#84cc16'
  if (s < 65) return '#d97706'
  return '#b91c1c'
}

export default function HistoryView({ onBack, onRunNew }: HistoryViewProps) {
  const history = loadHistory()

  return (
    <div className="screen history-screen">
      <div className="history-header">
        <button className="back-link" onClick={onBack}>&#8592; Back</button>
        <h2>History</h2>
      </div>

      {history.length === 0 ? (
        <div className="empty">
          <p>No scans yet.</p>
          <button className="record-btn" style={{ maxWidth: 200 }} onClick={onRunNew}>
            Run a scan
          </button>
        </div>
      ) : (
        <>
          <ul className="history-list">
            {history.map((r, i) => (
              <li key={i} className="history-item">
                <div className="history-item-score" style={{ background: scoreBg(r.score), color: scoreColor(r.score) }}>
                  {r.score}
                </div>
                <div className="history-item-info">
                  <div className="history-item-label">
                    {new Date(r.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="history-item-sub">
                    {new Date(r.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="history-footer">
            <button className="action-btn" onClick={onRunNew}>New Scan</button>
            <button className="action-btn" style={{ color: '#b91c1c' }} onClick={() => { clearHistory(); onBack() }}>
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  )
}
