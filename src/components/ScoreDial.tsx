interface ScoreDialProps {
  score: number
  size: number
}

export default function ScoreDial({ score, size }: ScoreDialProps) {
  const radius = size / 2
  const strokeWidth = size * 0.08
  const normalizedRadius = radius - strokeWidth
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = score / 100
  const strokeDashoffset = circumference * (1 - progress)

  const color = score < 35 ? '#4ade80' : score < 65 ? '#fbbf24' : '#ef4444'
  const textColor = score < 35 ? '#166534' : score < 65 ? '#92400e' : '#991b1b'
  const bgColor = score < 35 ? '#052e16' : score < 65 ? '#451a03' : '#450a0a'

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
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x={radius}
        y={radius}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={size * 0.3}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        {score}
      </text>
    </svg>
  )
}
