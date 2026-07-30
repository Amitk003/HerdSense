import { SCORE_LOW, SCORE_HIGH } from '../constants'

interface ScoreBadgeProps {
  score: number
  size?: 'md' | 'sm' | 'xs'
}

function scoreColor(s: number): string {
  if (s < SCORE_LOW) return 'var(--success)'
  if (s < SCORE_HIGH) return 'var(--warning)'
  return 'var(--danger)'
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const sz = size === 'xs' ? 'score-badge-xs' : size === 'sm' ? 'score-badge-sm' : ''
  return (
    <span className={`score-badge ${sz}`} style={{ color: scoreColor(score) }}>
      <span className="score-badge-num">{score}</span>
      <span className="score-badge-label">Stress</span>
    </span>
  )
}