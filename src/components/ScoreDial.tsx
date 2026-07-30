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

  const arc = score < 35 ? '#84cc16' : score < 65 ? '#d97706' : '#b91c1c'
  const num = score < 35 ? '#bef264' : score < 65 ? '#fde68a' : '#fca5a5'
  const track = score < 35 ? '#1a2e05' : score < 65 ? '#3b2200' : '#450a0a'

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
        x={r} y={r - size * 0.06}
        textAnchor="middle"
        fill={num}
        fontSize={size * 0.34}
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
      <text
        x={r} y={r + size * 0.14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.25)"
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
