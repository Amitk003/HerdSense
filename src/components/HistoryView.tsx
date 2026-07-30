import { useState } from 'react'
import { loadHistory, clearHistory } from '../utils/storage'
import { SCORE_LOW, SCORE_HIGH } from '../constants'

interface HistoryViewProps {
  onBack: () => void
  onRunNew: () => void
}

function scoreBg(s: number): string {
  if (s < SCORE_LOW) return '#1a2e05'
  if (s < SCORE_HIGH) return '#3b2200'
  return '#450a0a'
}

function scoreColor(s: number): string {
  if (s < SCORE_LOW) return '#84cc16'
  if (s < SCORE_HIGH) return '#d97706'
  return '#b91c1c'
}

export default function HistoryView({ onBack, onRunNew }: HistoryViewProps) {
  const [confirmClear, setConfirmClear] = useState(false)
  const history = loadHistory()

  const handleClear = () => {
    if (confirmClear) {
      clearHistory()
      onBack()
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  return (
    <div className="screen history-screen">
      <div className="history-header">
        <button className="back-link" onClick={onBack}>&#8592; Back</button>
        <h2>History</h2>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--sand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>No scans yet</p>
          <span className="empty-state-sub">Run a scan to see results here</span>
          <button className="nav-btn" style={{ maxWidth: 200, marginTop: 16 }} onClick={onRunNew}>
            Run a scan
          </button>
        </div>
      ) : (
        <>
          <div className="history-list">
            {history.map((r, i) => (
              <div key={i} className="history-item">
                <div className="history-item-score" style={{ background: scoreBg(r.score), color: scoreColor(r.score) }}>
                  {r.score}
                </div>
                <div className="history-item-info">
                  <div className="history-item-label">
                    {new Date(r.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="history-item-sub">
                    {new Date(r.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    {r.animalCount ? ` \u00b7 ${r.animalCount} animals` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="history-footer">
            <button className="action-btn" onClick={onRunNew}>New Scan</button>
            <button className={`action-btn ${confirmClear ? 'action-btn-danger' : ''}`} onClick={handleClear}>
              {confirmClear ? 'Tap again to clear' : 'Clear All'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}