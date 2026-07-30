import { SCORE_LOW, SCORE_HIGH } from '../constants'

interface ScoreDialProps {
  score: number
  size: number
}

export default function ScoreDial({ score, size }: ScoreDialProps) {
  const r = size / 2
  const sw = size * 0.09
  const nr = r - sw
  const circ = 2 * Math.PI * nr
  const pct = score / 100
  const offset = circ * (1 - pct)

  const arc = score < SCORE_LOW ? '#84cc16' : score < SCORE_HIGH ? '#d97706' : '#b91c1c'
  const num = score < SCORE_LOW ? '#bef264' : score < SCORE_HIGH ? '#fde68a' : '#fca5a5'
  const track = score < SCORE_LOW ? '#1a2e05' : score < SCORE_HIGH ? '#3b2200' : '#450a0a'

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="score-dial"
      aria-label={`Stress score ${score} out of 100`}
    >
      <circle
        cx={r} cy={r} r={nr}
        fill="none" stroke={track} strokeWidth={sw}
      />
      <circle
        cx={r} cy={r} r={nr}
        fill="none" stroke={arc} strokeWidth={sw}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${r} ${r})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={r} y={r + size * 0.04}
        textAnchor="middle"
        fill={num}
        fontSize={size * 0.34}
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
      <text
        x={r} y={r + size * 0.22}
        textAnchor="middle"
        fill="#a8a29e"
        fontSize={size * 0.065}
        fontWeight="600"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.18em"
      >
        STRESS
      </text>
    </svg>
  )
}
