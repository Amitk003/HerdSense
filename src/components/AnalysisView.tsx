import type { HerdStressResult } from '../pipeline/types'
import ScoreDial from './ScoreDial'
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
    <span style={{ color: 'var(--grass)' }}>
      &#8595; Falling &mdash; stress is dropping, herd recovering
    </span>
  )
  if (trend === 'escalating') return (
    <span style={{ color: 'var(--dust)' }}>
      &#8593; Rising &mdash; stress increasing, watch closely
    </span>
  )
  return (
    <span style={{ color: 'var(--straw)' }}>
      &#8594; Stable &mdash; no significant change
    </span>
  )
}

function ScoreContext({ score }: { score: number }) {
  if (score < SCORE_LOW) return 'Your herd looks healthy. No signs of stress.'
  if (score < SCORE_HIGH) return 'Your herd shows some stress signs. Keep watching.'
  return 'Your herd needs attention. Consider taking action.'
}

const SUB_SCORES: { key: keyof HerdStressResult; label: string; desc: string; color: string }[] = [
  { key: 'clustering', label: 'Clustering', desc: 'How bunched together', color: '#84cc16' },
  { key: 'motion', label: 'Motion', desc: 'Walking pattern', color: '#06b6d4' },
  { key: 'posture', label: 'Posture', desc: 'Head position', color: '#d97706' },
  { key: 'audio', label: 'Audio', desc: 'Vocalizations', color: '#a78bfa' }
]

export default function AnalysisView({ result, onBack, onShare, onViewHistory, onViewMap }: AnalysisViewProps) {
  const barColor = result.score < SCORE_LOW ? '#84cc16' : result.score < SCORE_HIGH ? '#d97706' : '#b91c1c'

  return (
    <div className="screen analysis-screen">
      <button className="back-link" onClick={onBack}>&#8592; Back</button>

      <div className="analysis-hero">
        <ScoreDial score={result.score} size={180} />
        <p className="analysis-context" style={{ color: 'var(--sand)', fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 260 }}>
          <ScoreContext score={result.score} />
        </p>
        <div className="analysis-trend">
          <TrendDisplay trend={result.trend} />
        </div>
      </div>

      <div className="analysis-breakdown">
        <div className="stacked-bar">
          {SUB_SCORES.map(s => {
            const val = result[s.key] as number
            const total = result.clustering + result.motion + result.posture + result.audio
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

      <strong style={{ fontSize: 13, color: 'var(--sand)', padding: '0 4px' }}>
        {result.species} &middot; {result.animalCount} animals
      </strong>

      <div className="analysis-recommendation">
        <span className="rec-icon" style={{ background: barColor, color: '#1a1410' }}>!</span>
        {result.recommendation}
      </div>

      <div className="analysis-actions">
        <button className="share-btn" onClick={onShare}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share with nearby
        </button>
        <button className="action-btn" onClick={onViewMap}>Map</button>
        <button className="action-btn" onClick={onViewHistory}>History</button>
      </div>
    </div>
  )
}