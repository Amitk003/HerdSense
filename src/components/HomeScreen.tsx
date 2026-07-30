import { loadHistory } from '../utils/storage'
import ScoreBadge from './ScoreDial'

interface HomeScreenProps {
  onNavigateCamera: () => void
  onNavigateUpload: () => void
  onNavigateMap: () => void
  onNavigateHistory: () => void
}

export default function HomeScreen({ onNavigateCamera, onNavigateUpload, onNavigateMap, onNavigateHistory }: HomeScreenProps) {
  const history = loadHistory()
  const lastScore = history.length > 0 ? history[0].score : null

  return (
    <div className="screen home-screen">

      <div className="home-header">
        <h1 className="app-title">HerdSense</h1>
        <p className="app-subtitle">Livestock stress detection</p>
      </div>

      <div className="home-cta">
        <button className="record-btn-big" onClick={onNavigateCamera}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Record
        </button>
        <button className="record-btn-big upload-btn-big" onClick={onNavigateUpload}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload
        </button>
        <button className="home-quick-btn" onClick={onNavigateMap} aria-label="Map">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </button>
      </div>

      {lastScore !== null && (
        <div
          className="card last-scan-card"
          role="button"
          tabIndex={0}
          onClick={onNavigateHistory}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateHistory() }}
        >
          <span className="last-scan-label">Last scan</span>
          <div className="last-scan-score">
            <ScoreBadge score={lastScore} size="xs" />
          </div>
        </div>
      )}

      <div className="home-nav">
        <div
          className="card"
          role="button"
          tabIndex={0}
          onClick={onNavigateHistory}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateHistory() }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 6px' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          History
        </div>
        <div
          className="card"
          role="button"
          tabIndex={0}
          onClick={onNavigateMap}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateMap() }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 6px' }}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          Map
        </div>
      </div>
    </div>
  )
}