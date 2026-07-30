interface ScoreDialProps {
  score: number
  size: number
}

export default function ScoreDial({ score, size }: ScoreDialProps) {
  const radius = size / 2
  const strokeWidth = size * 0.09
  const innerRadius = radius - strokeWidth * 1.5
  const normalizedRadius = radius - strokeWidth
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = score / 100
  const strokeDashoffset = circumference * (1 - progress)

  const color = score < 35 ? '#84cc16' : score < 65 ? '#d97706' : '#b91c1c'
  const textColor = score < 35 ? '#bef264' : score < 65 ? '#fde68a' : '#fca5a5'
  const bgColor = score < 35 ? '#1a2e05' : score < 65 ? '#3b2200' : '#450a0a'

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="score-dial"
      aria-label={`Stress score ${score} out of 100`}
    >
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${radius} ${radius})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <circle
        cx={radius}
        cy={radius}
        r={innerRadius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
      />
      <text
        x={radius}
        y={radius - size * 0.08}
        textAnchor="middle"
        fill={textColor}
        fontSize={size * 0.36}
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {score}
      </text>
      <text
        x={radius}
        y={radius + size * 0.14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.3)"
        fontSize={size * 0.07}
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.15em"
      >
        STRESS
      </text>
    </svg>
  )
}
