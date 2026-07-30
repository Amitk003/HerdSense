import { useState, useMemo } from 'react'
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

export default function StressMap({ onBack, reports = [] }: StressMapProps) {
  const [tilesLoaded, setTilesLoaded] = useState(false)

  const clusters: AlertCluster[] = useMemo(() => findAlertClusters(reports), [reports])

  const center: [number, number] = reports.length > 0
    ? [reports[0].lat, reports[0].lng]
    : [3.52, 38.48]

  const highStressCount = reports.filter(r => r.score > 60).length

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
      </div>

      {reports.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '24px 16px', color: '#a8a29e' }}>
          <p>No reports yet. Start a scan or connect to nearby users.</p>
        </div>
      )}

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

      {reports.length > 0 && (
        <div className="alert-section">
          <h3>Herd reports ({reports.length})</h3>
          <div className="alert-cards">
            {reports.slice(0, 20).map(r => (
              <div key={r.id} className="alert-card" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: scoreColor(r.score), display: 'inline-block', flexShrink: 0
                }} />
                <span style={{ fontWeight: 600 }}>Score {r.score}</span>
                <span style={{ color: '#a8a29e', fontSize: 13 }}>{r.species} x{r.animalCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}