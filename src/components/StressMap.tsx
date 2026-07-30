import { useMemo } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip } from 'react-leaflet'
import type { StressReport, AlertCluster } from '../pipeline/types'
import { findAlertClusters } from '../utils/clustering'

function scoreColor(s: number): string {
  if (s < 35) return '#84cc16'
  if (s < 65) return '#d97706'
  return '#b91c1c'
}

function scoreOpacity(s: number): number {
  return 0.4 + (s / 100) * 0.6
}

interface StressMapProps {
  onBack?: () => void
  reports?: StressReport[]
}

<<<<<<< HEAD
export default function StressMap({ onBack }: StressMapProps) {
  const [day, setDay] = useState(14)
  const [showNdvi, setShowNdvi] = useState(false)
  const [tilesLoaded, setTilesLoaded] = useState(false)

  const timeline = useMemo(() => getNdviTimeline(), [])
  const reports = useMemo(() => getReportsUpToDay(day), [day])
  const clusters = useMemo(() => getClusters(day), [day])
  const currentNdvi = useMemo(() => getNdviAtDay(day), [day])

  const center: [number, number] = [3.52, 38.48]
=======
export default function StressMap({ onBack, reports = [] }: StressMapProps) {
  const clusters: AlertCluster[] = useMemo(() => findAlertClusters(reports), [reports])

  const center: [number, number] = reports.length > 0
    ? [reports[0].lat, reports[0].lng]
    : [3.52, 38.48]
>>>>>>> ae6fc8d (fix-pipeline: remove mock data, fix detector class IDs, wire real pipeline)

  const highStressCount = reports.filter(r => r.score > 60).length

  const ndviPolygon: [number, number][][] = useMemo(() => {
    const grid: [number, number][] = []
    const latStart = 3.35, lngStart = 38.30
    const size = 0.25, rows = 6, cols = 6
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.push([latStart + r * size / rows, lngStart + c * size / cols])
      }
    }
    const topo: [number, number][] = grid.map(([lat, lng], i) => {
      const factor = 1 - (currentNdvi / 0.50)
      const jitter = (Math.sin(i * 1.5) * 0.5 + Math.cos(i * 0.7) * 0.5) * factor * 0.02
      return [lat + jitter, lng + jitter] as [number, number]
    })
    const hull: [number, number][] = [
      [3.35, 38.30], [3.45, 38.30], [3.55, 38.30],
      [3.60, 38.40], [3.55, 38.55], [3.45, 38.55],
      [3.35, 38.55], [3.30, 38.40]
    ]
    return [hull]
  }, [currentNdvi])

  return (
    <div className="screen map-screen">
      <div className="map-header">
        {onBack && <button className="back-link" onClick={onBack}>&#8592; Back</button>}
        <h1>Regional Map</h1>
      </div>

      <div className="map-body">
        <MapContainer center={center} zoom={10} className="map-container" zoomControl={false}>
          {!tilesLoaded && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: '#2d241e', zIndex: 500,
              color: '#a8a29e', fontSize: 14
            }}>
              Loading map tiles...
            </div>
          )}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ load: () => setTilesLoaded(true) }}
          />
          {showNdvi && (
            <GeoJSON
              data={{
                type: 'Feature',
                properties: {},
                geometry: { type: 'Polygon', coordinates: ndviPolygon }
              } as any}
              pathOptions={{
                color: currentNdvi < 0.30 ? '#b91c1c' : '#84cc16',
                fillColor: currentNdvi < 0.30 ? '#b91c1c' : '#84cc16',
                fillOpacity: 0.15 + (1 - currentNdvi) * 0.3,
                weight: 1,
                opacity: 0.5
              }}
            />
          )}
          {reports.map(r => (
            <CircleMarker
              key={r.id}
              center={[r.lat, r.lng]}
              radius={6 + (r.score / 100) * 8}
              pathOptions={{
                color: scoreColor(r.score),
                fillColor: scoreColor(r.score),
                fillOpacity: scoreOpacity(r.score),
                weight: 1.5
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {r.species} &middot; Score {r.score} &middot; {r.animalCount} animals
              </Tooltip>
            </CircleMarker>
          ))}
          {clusters.map((c, i) => (
            <Circle
              key={i}
              center={[c.center.lat, c.center.lng]}
              radius={c.radiusKm * 1000}
              pathOptions={{
                color: '#b91c1c',
                fillColor: '#b91c1c',
                fillOpacity: 0.06,
                weight: 1.5,
                dashArray: '6 4'
              }}
            />
          ))}
        </MapContainer>

<<<<<<< HEAD
        <div className="map-stats-overlay">
          <div className="map-stat-badge">
            <div className="num" style={{ color: '#84cc16' }}>{reports.length}</div>
            <div className="lbl">Reports</div>
          </div>
          <div className="map-stat-badge">
            <div className="num" style={{ color: highStressCount > 5 ? '#b91c1c' : '#d97706' }}>{highStressCount}</div>
            <div className="lbl">High stress</div>
          </div>
          <div className="map-stat-badge">
            <div className="num" style={{ color: clusters.length > 0 ? '#b91c1c' : '#a8a29e' }}>{clusters.length}</div>
            <div className="lbl">Alerts</div>
          </div>
=======
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
                    {new Date(report.timestamp).toLocaleDateString()}
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
          </MapContainer>
>>>>>>> ae6fc8d (fix-pipeline: remove mock data, fix detector class IDs, wire real pipeline)
        </div>

<<<<<<< HEAD
        <div className="map-legend-overlay">
          <span className="map-legend-item">
            <span className="map-legend-dot" style={{ background: '#84cc16' }} /> Low
          </span>
          <span className="map-legend-item">
            <span className="map-legend-dot" style={{ background: '#d97706' }} /> Mod
          </span>
          <span className="map-legend-item">
            <span className="map-legend-dot" style={{ background: '#b91c1c' }} /> High
          </span>
        </div>

        <div className="map-timeline">
          <div className="map-toggles">
            <label className="map-toggle-label">
              <input type="checkbox" checked={showNdvi} onChange={() => setShowNdvi(v => !v)} />
              NDVI overlay
            </label>
=======
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4ade80' }}>
            {reports.length}
>>>>>>> ae6fc8d (fix-pipeline: remove mock data, fix detector class IDs, wire real pipeline)
          </div>
          <div className="tl-label">
            <span>Day {day}</span>
            <span>NDVI: {currentNdvi.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={18}
            value={day}
            onChange={e => setDay(Number(e.target.value))}
          />
          <div className="tl-marks">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>18</span>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {day >= timeline.alertDay && (
        <div className="lead-time-banner">
          <div className="big">{timeline.leadTimeDays}</div>
          <div className="sub">days lead over satellite NDVI</div>
          <div className="note">HerdSense alert day {timeline.alertDay} &middot; NDVI breach day {timeline.breachDay}</div>
        </div>
      )}

      <div className="ndvi-section">
        <h3>NDVI Timeline</h3>
        <div className="ndvi-chart">
          {NDVI_READINGS.map(r => {
            const h = Math.max(2, r.ndvi * 180)
            const isAlert = r.day === timeline.alertDay
            const isBreach = r.ndvi < 0.30
            const c = isAlert ? '#84cc16' : isBreach ? '#b91c1c' : '#06b6d4'
            return (
              <div key={r.day} className="ndvi-bar-wrap">
                <div className="ndvi-bar" style={{ height: h + 'px', backgroundColor: c }} title={`Day ${r.day}: ${r.ndvi}`} />
                <span className="ndvi-bar-label">{r.day}</span>
              </div>
            )
          })}
        </div>
      </div>

=======
      {reports.length === 0 && (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <p style={{ color: '#94a3b8', marginTop: 8 }}>No reports yet. Start a scan or connect to nearby users.</p>
        </div>
      )}

>>>>>>> ae6fc8d (fix-pipeline: remove mock data, fix detector class IDs, wire real pipeline)
      {clusters.length > 0 && (
        <div className="alert-section">
          <h3>Active Alerts</h3>
          <div className="alert-cards">
            {clusters.map((c, i) => (
              <div key={i} className="alert-card">
                <div className="alert-card-header">
                  <span className="alert-tag">Alert #{i + 1}</span>
                  <span className="alert-meta">{c.herdCount} herds</span>
                </div>
                <div className="alert-text">
                  Avg stress {c.avgScore} at {c.center.lat.toFixed(2)}, {c.center.lng.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
<<<<<<< HEAD
=======

      {reports.length > 0 && (
        <div className="alerts-section">
          <h2 className="section-title" style={{ fontSize: 14 }}>
            Herd reports ({reports.length})
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
      )}
>>>>>>> ae6fc8d (fix-pipeline: remove mock data, fix detector class IDs, wire real pipeline)
    </div>
  )
}
