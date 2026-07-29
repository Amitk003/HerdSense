import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, GeoJSON } from 'react-leaflet'
import { getReportsUpToDay, getClusters, getNdviAtDay, getBreachDay, NDVI_READINGS } from '../data/mock-reports'
import { getNdviTimeline } from '../data/mock-ndvi'

function scoreColor(score: number): string {
  if (score < 35) return '#4ade80'
  if (score < 65) return '#fbbf24'
  return '#ef4444'
}

function scoreOpacity(score: number): number {
  return 0.4 + (score / 100) * 0.6
}

export default function StressMap() {
  const [day, setDay] = useState(14)
  const [showNdvi, setShowNdvi] = useState(false)

  const timeline = useMemo(() => getNdviTimeline(), [])

  const reports = useMemo(() => getReportsUpToDay(day), [day])
  const clusters = useMemo(() => getClusters(day), [day])
  const currentNdvi = useMemo(() => getNdviAtDay(day), [day])
  const breachDay = useMemo(() => getBreachDay(), [])

  const center: [number, number] = [3.52, 38.48]
  const herdSenseAlertDay = timeline.alertDay
  const showAlert = day >= herdSenseAlertDay
  const showBreach = day >= breachDay

  const highStressCount = reports.filter(r => r.score > 60).length

  return (
    <div className="app">
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 className="section-title" style={{ margin: 0 }}>Regional Stress Map</h1>
      </header>

      <div className="map-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#4ade80' }} /> Low (0-35)
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#fbbf24' }} /> Moderate (36-65)
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }} /> Critical (66-100)
        </span>
      </div>

      <div className="map-card">
        <div className="map-container">
          <MapContainer
            center={center}
            zoom={10}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {reports.map(report => (
              <CircleMarker
                key={report.id}
                center={[report.lat, report.lng]}
                radius={8}
                pathOptions={{
                  color: scoreColor(report.score),
                  fillColor: scoreColor(report.score),
                  fillOpacity: scoreOpacity(report.score),
                  weight: 2
                }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <div>
                    <strong>Score: {report.score}</strong><br />
                    {report.species} ({report.animalCount})<br />
                    Day {report.day}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

            {clusters.map((cluster, i) => (
              <Circle
                key={`cluster-${i}`}
                center={[cluster.center.lat, cluster.center.lng]}
                radius={15000}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.08,
                  weight: 2,
                  dashArray: '5 5'
                }}
              >
                <Tooltip direction="top">
                  <div>
                    <strong>Alert zone</strong><br />
                    {cluster.herdCount} herds, avg {cluster.avgScore}
                  </div>
                </Tooltip>
              </Circle>
            ))}

            {showNdvi && (
              <GeoJSON
                key={`ndvi-${day}`}
                data={{
                  type: 'FeatureCollection',
                  features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'Polygon',
                      coordinates: [[
                        [38.2, 3.2],
                        [38.8, 3.2],
                        [38.8, 3.8],
                        [38.2, 3.8],
                        [38.2, 3.2]
                      ]]
                    }
                  }]
                } as any}
                style={{
                  color: '#2563eb',
                  fillColor: '#2563eb',
                  fillOpacity: 0.06 + (1 - currentNdvi) * 0.2,
                  weight: 1
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>

      <div className="controls-section">
        <div className="timeline-label">
          <span>Day {day}</span>
          <span>{new Date(2026, 6, 20 + day).toLocaleDateString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={18}
          value={day}
          onChange={e => setDay(parseInt(e.target.value))}
          className="timeline-slider"
        />
        <div className="timeline-markers">
          <span>Start</span>
          <span style={{ color: showAlert ? 'var(--green)' : undefined }}>
            HerdSense alert
          </span>
          <span style={{ color: showBreach ? 'var(--red)' : undefined }}>
            NDVI breach
          </span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4ade80' }}>
            {reports.length}
          </div>
          <div className="stat-label">Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: highStressCount > 5 ? '#ef4444' : '#fbbf24' }}>
            {highStressCount}
          </div>
          <div className="stat-label">High stress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: clusters.length > 0 ? '#ef4444' : '#94a3b8' }}>
            {clusters.length}
          </div>
          <div className="stat-label">Alert zones</div>
        </div>
      </div>

      <div className="toggle-row">
        <input
          type="checkbox"
          id="ndvi-toggle"
          checked={showNdvi}
          onChange={e => setShowNdvi(e.target.checked)}
        />
        <label htmlFor="ndvi-toggle">
          Show NDVI overlay (current: {(currentNdvi * 100).toFixed(0)}%)
        </label>
      </div>

      {showAlert && (
        <div className="lead-time-banner">
          <div className="lead-time-number">{timeline.leadTimeDays} days</div>
          <div className="lead-time-label">
            HerdSense detected stress before satellite NDVI
          </div>
          <div className="lead-time-sub">
            Alert on day {timeline.alertDay} | NDVI breach on day {timeline.breachDay}
          </div>
        </div>
      )}

      <div className="ndvi-chart">
        <div className="chart-title">NDVI timeline (Sentinel-2)</div>
        <div className="chart-bars">
          {NDVI_READINGS.map(r => {
            const barHeight = Math.max(2, r.ndvi * 200)
            const isAlertDay = r.day === timeline.alertDay
            const isBreach = r.ndvi < 0.30
            const barColor = isAlertDay ? '#4ade80' : isBreach ? '#ef4444' : '#2563eb'
            return (
              <div key={r.day} className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{
                    height: barHeight + 'px',
                    backgroundColor: barColor
                  }}
                  title={`Day ${r.day}: NDVI ${r.ndvi}`}
                />
                <div className="chart-bar-label">
                  {r.day === 0 ? '0' : r.day === 18 ? '18' : ''}
                </div>
              </div>
            )
          })}
        </div>
        <div className="chart-threshold" />
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
          Red bars = below drought threshold (NDVI &lt; 0.30)
        </div>
      </div>

      {clusters.length > 0 && (
        <div className="alerts-section">
          <h2 className="section-title">Active alerts</h2>
          {clusters.map((cluster, i) => (
            <div key={i} className="alert-card">
              <div className="alert-header">
                <span className="alert-severity">
                  {cluster.avgScore > 75 ? 'HIGH SEVERITY' : 'MODERATE SEVERITY'}
                </span>
                <span className="alert-count">{cluster.herdCount} herds</span>
              </div>
              <div className="alert-detail">
                Avg score {cluster.avgScore} | {cluster.members.map(m => m.species).filter((v, idx, a) => a.indexOf(v) === idx).join(', ')}
              </div>
              <div className="alert-detail" style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                Recommended: Move herds toward water point
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="alerts-section">
        <h2 className="section-title" style={{ fontSize: 14 }}>
          Herd reports (day {day})
        </h2>
        <div className="report-list">
          {reports.map(r => (
            <div key={r.id} className="report-item">
              <span className="report-score-dot" style={{ background: scoreColor(r.score) }} />
              <span style={{ fontWeight: 600 }}>Score {r.score}</span>
              <span className="report-species">{r.species} x{r.animalCount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
