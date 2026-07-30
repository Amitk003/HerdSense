import { useState } from 'react'
import type { HerdStressResult } from '../pipeline/types'
import ScoreDial from './ScoreDial'

interface AnalysisViewProps {
  result: HerdStressResult
  onBack: () => void
  onViewHistory: () => void
  onViewMap: () => void
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <span className="trend-arrow down">&#8595;</span>
  if (trend === 'escalating') return <span className="trend-arrow up">&#8593;</span>
  return <span className="trend-arrow right">&#8212;</span>
}

function TrendLabel({ trend }: { trend: string }) {
  if (trend === 'improving') return <span className="trend-label falling">Falling</span>
  if (trend === 'escalating') return <span className="trend-label rising">Rising</span>
  return <span className="trend-label flat">Stable</span>
}

const SUB_SCORES: { key: keyof HerdStressResult; label: string; color: string }[] = [
  { key: 'clustering', label: 'C', color: '#84cc16' },
  { key: 'motion', label: 'M', color: '#06b6d4' },
  { key: 'posture', label: 'P', color: '#d97706' },
  { key: 'audio', label: 'A', color: '#a78bfa' }
]

export default function AnalysisView({ result, onBack, onViewHistory, onViewMap }: AnalysisViewProps) {
  const [toast, setToast] = useState('')
  const barColor = result.score < 35 ? '#84cc16' : result.score < 65 ? '#d97706' : '#b91c1c'
  const total = result.clustering + result.motion + result.posture + result.audio

  const copyReport = async () => {
    const p = { lat: 3.5, lng: 38.5, score: result.score, timestamp: result.timestamp }
    try {
      await navigator.clipboard.writeText(JSON.stringify(p))
      setToast('Report copied')
    } catch {
      setToast('Copy failed - use HTTPS')
    }
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="screen analysis-screen">
      {toast && <div className="toast">{toast}</div>}

      <button className="back-link" onClick={onBack}>&#8592; Back</button>

      <div className="analysis-hero">
        <ScoreDial score={result.score} size={180} />
        <div className="analysis-trend">
          <TrendIcon trend={result.trend} />
          <TrendLabel trend={result.trend} />
        </div>
      </div>

      <div className="analysis-breakdown">
        <div className="stacked-bar">
          {SUB_SCORES.map(s => {
            const val = result[s.key] as number
            const pct = total > 0 ? (val / total) * 100 : 0
            return (
              <div
                key={s.key}
                className="stacked-bar-seg"
                style={{ width: pct + '%', backgroundColor: s.color }}
              />
            )
          })}
        </div>
        <div className="subscore-labels">
          {SUB_SCORES.map(s => (
            <span key={s.key}>
              <span className="subscore-dot" style={{ background: s.color }} />
              {s.label} {Math.round((result[s.key] as number) * 100)}%
            </span>
          ))}
        </div>
      </div>

      <div className="analysis-recommendation">
        <span className="rec-icon" style={{ background: barColor, color: '#1a1410' }}>!</span>
        {result.recommendation}
      </div>

      <div className="analysis-actions">
        <button className="action-btn share" onClick={copyReport}>Share</button>
        <button className="action-btn" onClick={onViewMap}>Map</button>
        <button className="action-btn" onClick={onViewHistory}>History</button>
      </div>
    </div>
  )
}
