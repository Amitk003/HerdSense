import type { HerdStressResult } from '../pipeline/types'
import ScoreDial from './ScoreDial'

interface AnalysisViewProps {
  result: HerdStressResult
  onBack: () => void
  onViewHistory: () => void
  onViewMap: () => void
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') {
    return <span className="trend-icon trend-down">&#8595;</span>
  }
  if (trend === 'escalating') {
    return <span className="trend-icon trend-up">&#8593;</span>
  }
  return <span className="trend-icon trend-stable">&#8594;</span>
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: pct + '%', backgroundColor: color }}
        />
      </div>
      <span className="score-bar-value">{pct}%</span>
    </div>
  )
}

export default function AnalysisView({ result, onBack, onViewHistory, onViewMap }: AnalysisViewProps) {
  const barColor = result.score < 35 ? '#4ade80' : result.score < 65 ? '#fbbf24' : '#ef4444'

  return (
    <div className="screen analysis-screen">
      <header className="analysis-header">
        <button className="back-btn" onClick={onBack}>&#8592; Back</button>
        <h2 className="analysis-title">Results</h2>
      </header>

      <div className="score-main">
        <ScoreDial score={result.score} size={160} />
        <div className="trend-row">
          <TrendIcon trend={result.trend} />
          <span className={`trend-label trend-${result.trend}`}>
            {result.trend.charAt(0).toUpperCase() + result.trend.slice(1)}
          </span>
        </div>
      </div>

      <div className="recommendation-box" style={{ borderColor: barColor }}>
        <p className="recommendation-text">{result.recommendation}</p>
      </div>

      <section className="breakdown-section">
        <h3 className="section-title">Score breakdown</h3>
        <ScoreBar label="Clustering" value={result.clustering} color="#4ade80" />
        <ScoreBar label="Motion" value={result.motion} color="#60a5fa" />
        <ScoreBar label="Posture" value={result.posture} color="#fbbf24" />
        <ScoreBar label="Audio" value={result.audio} color="#a78bfa" />
      </section>

      <div className="share-row">
        <button className="share-btn" onClick={() => {
          const payload = {
            lat: 3.5,
            lng: 38.5,
            score: result.score,
            timestamp: result.timestamp
          }
          navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
          alert('Anonymized report copied to clipboard:\n' + JSON.stringify(payload))
        }}>
          Share Anonymized
        </button>
      </div>

      <nav className="analysis-nav">
        <button className="nav-btn" onClick={onViewHistory}>View History</button>
        <button className="nav-btn" onClick={onViewMap}>View Map</button>
      </nav>
    </div>
  )
}
