import { loadHistory, clearHistory } from '../utils/storage'
import ScoreDial from './ScoreDial'

interface HistoryViewProps {
  onBack: () => void
  onRunNew: () => void
}

export default function HistoryView({ onBack, onRunNew }: HistoryViewProps) {
  const history = loadHistory()

  const handleClear = () => {
    clearHistory()
    onBack()
  }

  return (
    <div className="screen history-screen">
      <header className="history-header">
        <button className="back-btn" onClick={onBack}>&#8592; Back</button>
        <h2 className="section-title">Scan History</h2>
      </header>

      {history.length === 0 ? (
        <div className="empty-state">
          <p>No scans recorded yet.</p>
          <button className="nav-btn" onClick={onRunNew}>Run a scan</button>
        </div>
      ) : (
        <>
          <ul className="history-list">
            {history.map((record, i) => (
              <li key={i} className="history-item">
                <ScoreDial score={record.score} size={40} />
                <div className="history-item-details">
                  <span className="history-item-date">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </span>
                  <span className="history-item-time">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="history-actions">
            <button className="nav-btn" onClick={onRunNew}>Run New Scan</button>
            <button className="nav-btn nav-btn-danger" onClick={handleClear}>
              Clear History
            </button>
          </div>
        </>
      )}
    </div>
  )
}
