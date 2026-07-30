import type { HerdStressResult } from '../pipeline/types'
import ScoreBadge from './ScoreDial'
import { SCORE_LOW, SCORE_HIGH } from '../constants'

interface AnalysisViewProps {
  result: HerdStressResult
  onBack: () => void
  onShare: () => void
  onViewHistory: () => void
  onViewMap: () => void
}

function TrendDisplay({ trend }: { trend: string }) {
  if (trend === 'improving') return (
    <span style={{ color: 'var(--success)' }}>
      &#8595; Falling - stress dropping, herd recovering
    </span>
  )
  if (trend === 'escalating') return (
    <span style={{ color: 'var(--danger)' }}>
      &#8593; Rising - stress increasing, watch closely
    </span>
  )
  return (
    <span style={{ color: 'var(--warning)' }}>
      &#8594; Stable - no significant change
    </span>
  )
}

function ScoreContext({ score }: { score: number }) {
  if (score < SCORE_LOW) return 'Your herd shows no signs of stress'
  if (score < SCORE_HIGH) return 'Your herd shows some stress signs'
  return 'Your herd needs attention'
}

function pillColor(val: number): string {
  if (val < 0.33) return 'var(--success)'
  if (val < 0.66) return 'var(--warning)'
  return 'var(--danger)'
}

const SUB_SCORES: { key: keyof HerdStressResult; label: string }[] = [
  { key: 'clustering', label: 'Clustering' },
  { key: 'motion', label: 'Motion' },
  { key: 'posture', label: 'Posture' },
  { key: 'audio', label: 'Audio' }
]

export default function AnalysisView({ result, onBack, onShare, onViewHistory, onViewMap }: AnalysisViewProps) {
  return (
    <div className="screen analysis-screen">
      <div className="card">
        <div className="analysis-hero">
          <ScoreBadge score={result.score} />
          <p className="analysis-context"><ScoreContext score={result.score} /></p>
          <div className="analysis-hero-meta">
            <span className="analysis-hero-meta-item">
              <span className="analysis-hero-meta-dot" style={{ background: 'var(--accent)' }} />
              {result.species}
            </span>
            <span className="analysis-hero-meta-item">
              <span className="analysis-hero-meta-dot" style={{ background: 'var(--text-muted)' }} />
              {result.animalCount} animals
            </span>
          </div>
          <div className="analysis-trend"><TrendDisplay trend={result.trend} /></div>
        </div>
      </div>

      <div className="analysis-breakdown">
        {SUB_SCORES.map(s => {
          const val = result[s.key] as number
          const pct = Math.round(val * 100)
          return (
            <div key={s.key} className="card breakdown-pill">
              <div className="breakdown-pill-header">
                <span className="breakdown-pill-label">{s.label}</span>
                <span className="breakdown-pill-value" style={{ color: pillColor(val) }}>{pct}%</span>
              </div>
              <div className="breakdown-pill-track">
                <div className="breakdown-pill-fill" style={{ width: pct + '%', background: pillColor(val) }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="card analysis-rec">
        <span className="analysis-rec-icon" style={{ background: pillColor(result.score / 100) }}>!</span>
        <span className="analysis-rec-text">{result.recommendation}</span>
      </div>

      <div className="analysis-actions">
        <button className="share-btn" onClick={onShare}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
        <button className="action-btn" onClick={onViewMap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 4 }}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          Map
        </button>
        <button className="action-btn" onClick={onViewHistory}>History</button>
      </div>
    </div>
  )
}