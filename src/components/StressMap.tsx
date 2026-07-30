import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, GeoJSON } from 'react-leaflet'
import { getReportsUpToDay, getClusters, getNdviAtDay, NDVI_READINGS } from '../data/mock-reports'
import { getNdviTimeline } from '../data/mock-ndvi'

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
}

export default function StressMap({ onBack }: StressMapProps) {
  const [day, setDay] = useState(14)
  const [showNdvi, setShowNdvi] = useState(false)
  const [tilesLoaded, setTilesLoaded] = useState(false)

  const timeline = useMemo(() => getNdviTimeline(), [])
  const reports = useMemo(() => getReportsUpToDay(day), [day])
  const clusters = useMemo(() => getClusters(day), [day])
  const currentNdvi = useMemo(() => getNdviAtDay(day), [day])

  const center: [number, number] = [3.52, 38.48]

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
        </div>

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
    </div>
  )
}
