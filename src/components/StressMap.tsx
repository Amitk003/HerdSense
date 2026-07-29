import { useState } from 'react'
import { getAggregatedData } from '../data/mock-reports'
import { getNdviTimeline, type NdviTimeline } from '../data/mock-ndvi'
import type { AggregatedData } from '../data/mock-reports'

interface StressMapProps {
  onBack: () => void
}

const CENTER_LAT = 3.52
const CENTER_LNG = 38.48

function scoreColor(score: number): string {
  if (score < 35) return '#4ade80'
  if (score < 65) return '#fbbf24'
  return '#ef4444'
}

export default function StressMap({ onBack }: StressMapProps) {
  const [day, setDay] = useState(15)
  const [showNdvi, setShowNdvi] = useState(false)
  const [data] = useState<AggregatedData>(() => getAggregatedData())
  const [ndvi] = useState<NdviTimeline>(() => getNdviTimeline(3))

  const filteredReports = data.reports.filter(r => {
    const reportDay = (new Date(r.timestamp).getTime() - new Date('2026-07-01').getTime()) / (1000 * 60 * 60 * 24)
    return reportDay <= day
  })

  return (
    <div className="screen map-screen">
      <header className="map-header">
        <button className="back-btn" onClick={onBack}>&#8592; Back</button>
        <h2 className="section-title">Regional Stress Map</h2>
      </header>

      <div className="map-legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#4ade80' }} /> Low (0-35)</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#fbbf24' }} /> Moderate (36-65)</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> Critical (66-100)</span>
      </div>

      <div className="map-container">
        <svg
          viewBox="38.2 3.3 0.5 0.5"
          className="map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {filteredReports.map((r, i) => {
            const x = ((r.lng - 38.3) / 0.4) * 100
            const y = ((r.lat - 3.35) / 0.4) * 100
            return (
              <g key={i}>
                <circle
                  cx={x} cy={y} r={3 + r.score / 30}
                  fill={scoreColor(r.score)}
                  opacity={0.7}
                  stroke={scoreColor(r.score)}
                  strokeWidth={1}
                >
                  <title>{`Score: ${r.score} | ${r.species} (${r.animalCount})`}</title>
                </circle>
              </g>
            )
          })}

          {showNdvi && filteredReports.length > 0 && (
            <rect
              x={0} y={0} width={100} height={100}
              fill="#2563eb" opacity={0.08}
            >
              <title>NDVI overlay active (simplified visualization)</title>
            </rect>
          )}
        </svg>

        <div className="map-placeholder-note">
          Map showing {filteredReports.length} herd reports
          {showNdvi && ' with NDVI overlay'}
        </div>
      </div>

      <div className="timeline-controls">
        <label className="timeline-label">
          Timeline: Day {day}
        </label>
        <input
          type="range"
          min={0}
          max={29}
          value={day}
          onChange={e => setDay(parseInt(e.target.value))}
          className="timeline-slider"
        />

        <div className="timeline-annotations">
          <div className="timeline-annotation" style={{ left: `${(day / 29) * 100}%` }}>
            <span className="annotation-badge annotation-herdsense">
              HerdSense alert (Day {ndvi.leadTimeDays > 0 ? '3' : '-'})
            </span>
          </div>
          {ndvi.breachDate && (
            <div className="timeline-annotation" style={{ left: `${((ndvi.leadTimeDays + 3) / 29) * 100}%` }}>
              <span className="annotation-badge annotation-ndvi">
                NDVI breach (Day {ndvi.leadTimeDays + 3})
              </span>
            </div>
          )}
        </div>

        {ndvi.leadTimeDays > 0 && day >= 3 && (
          <div className="lead-time-banner">
            HerdSense detected stress {ndvi.leadTimeDays} days before satellite NDVI
          </div>
        )}
      </div>

      <div className="map-controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showNdvi}
            onChange={e => setShowNdvi(e.target.checked)}
          />
          <span>Show NDVI overlay</span>
        </label>
      </div>

      {data.alerts.length > 0 && (
        <section className="alerts-section">
          <h3 className="section-title">Active alerts</h3>
          {data.alerts.map((alert, i) => (
            <div key={i} className="alert-card">
              <span className="alert-severity">
                {alert.avgScore > 75 ? 'HIGH' : 'MODERATE'}
              </span>
              <span className="alert-detail">
                {alert.herdCount} herds in 15km radius, avg score {alert.avgScore}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
