import { useState, useMemo, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import type { StressReport, AlertCluster } from '../pipeline/types'
import { findAlertClusters } from '../utils/clustering'
import { SCORE_LOW, SCORE_HIGH } from '../constants'

function scoreColor(s: number): string {
  if (s < SCORE_LOW) return 'var(--success)'
  if (s < SCORE_HIGH) return 'var(--warning)'
  return 'var(--danger)'
}

function scoreOpacity(s: number): number {
  return 0.4 + (s / 100) * 0.6
}

interface MapControllerProps {
  focusedReportId: string | null
  reports: StressReport[]
  onClusterAlert?: (cluster: AlertCluster) => void
}

function MapController({ focusedReportId, reports, onClusterAlert }: MapControllerProps) {
  const map = useMap()
  const prevClusterKeys = useRef<Set<string>>(new Set())
  const [tileError, setTileError] = useState(false)

  useEffect(() => {
    map.invalidateSize()
    const timer = setTimeout(() => map.invalidateSize(), 250)
    return () => clearTimeout(timer)
  }, [map])

  useEffect(() => {
    const timeout = setTimeout(() => setTileError(true), 8000)
    map.on('tileload', () => setTileError(false))
    return () => clearTimeout(timeout)
  }, [map])

  useEffect(() => {
    if (!focusedReportId) return
    const report = reports.find(r => r.id === focusedReportId)
    if (report) {
      map.flyTo([report.lat, report.lng], 12, { duration: 1 })
    }
  }, [focusedReportId, reports, map])

  useEffect(() => {
    const clusters = findAlertClusters(reports)
    for (const c of clusters) {
      const key = `${c.center.lat.toFixed(2)}-${c.center.lng.toFixed(2)}-${c.herdCount}`
      if (!prevClusterKeys.current.has(key)) {
        prevClusterKeys.current.add(key)
        onClusterAlert?.(c)
      }
    }
  }, [reports, onClusterAlert])

  if (tileError) {
    return (
      <div className="map-tile-overlay">
        <span>Map tiles unavailable offline.</span>
        <span className="map-tile-overlay-sub">Report markers still show.</span>
      </div>
    )
  }

  return null
}

interface StressMapProps {
  onBack?: () => void
  reports?: StressReport[]
  location?: { lat: number; lng: number } | null
  focusedReportId?: string | null
  onClusterAlert?: (cluster: AlertCluster) => void
}

export default function StressMap({ onBack, reports = [], location, focusedReportId, onClusterAlert }: StressMapProps) {
  const [tilesLoaded, setTilesLoaded] = useState(false)

  const clusters: AlertCluster[] = useMemo(() => findAlertClusters(reports), [reports])

  const center: [number, number] = useMemo(() => {
    if (focusedReportId) {
      const rep = reports.find(r => r.id === focusedReportId)
      if (rep) return [rep.lat, rep.lng]
    }
    if (reports.length > 0) return [reports[0].lat, reports[0].lng]
    if (location) return [location.lat, location.lng]
    return [1.35, 36.82]
  }, [focusedReportId, reports, location])

  const highStressCount = reports.filter(r => r.score > 60).length

  return (
    <div className="screen map-screen">
      <div className="map-body">
        <MapContainer center={center} zoom={reports.length > 0 ? 10 : 7} className="map-container" zoomControl={false}>
          <MapController
            focusedReportId={focusedReportId ?? null}
            reports={reports}
            onClusterAlert={onClusterAlert}
          />
          {!tilesLoaded && (
            <div className="map-tile-overlay">Loading map tiles...</div>
          )}
          {reports.length === 0 && (
            <div className="map-tile-overlay" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', color: 'var(--text)', padding: '10px 16px', borderRadius: 8 }}>
              No nearby reports yet. Run a scan and tap Share to add your herd.
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
          {clusters.map((c) => (
            <Circle
              key={`cluster-${c.center.lat.toFixed(3)}-${c.center.lng.toFixed(3)}-${c.herdCount}`}
              center={[c.center.lat, c.center.lng]}
              radius={c.radiusKm * 1000}
              pathOptions={{
                color: 'var(--danger)',
                fillColor: 'var(--danger)',
                fillOpacity: 0.06,
                weight: 1.5,
                dashArray: '6 4'
              }}
            />
          ))}
        </MapContainer>

        <div className="map-stats-overlay">
          <div className="map-stat-badge">
            <div className="num" style={{ color: 'var(--success)' }}>{reports.length}</div>
            <div className="lbl">Reports</div>
          </div>
          <div className="map-stat-badge">
            <div className="num" style={{ color: highStressCount > 5 ? 'var(--danger)' : 'var(--warning)' }}>{highStressCount}</div>
            <div className="lbl">High stress</div>
          </div>
          <div className="map-stat-badge">
            <div className="num" style={{ color: clusters.length > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{clusters.length}</div>
            <div className="lbl">Alerts</div>
          </div>
        </div>

        <div className="map-legend-overlay">
          <span className="map-legend-item">
            <span className="map-legend-dot" style={{ background: 'var(--success)' }} /> Low
          </span>
          <span className="map-legend-item">
            <span className="map-legend-dot" style={{ background: 'var(--warning)' }} /> Mod
          </span>
          <span className="map-legend-item">
            <span className="map-legend-dot" style={{ background: 'var(--danger)' }} /> High
          </span>
        </div>
      </div>

      {reports.length > 0 && clusters.length > 0 && (
        <div className="alert-section">
          <h3 className="alert-section-title">Active alerts</h3>
          <div className="alert-cards">
            {clusters.map((c, i) => (
              <div key={`alert-${c.center.lat.toFixed(3)}-${c.center.lng.toFixed(3)}-${c.herdCount}`} className="alert-card">
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
          <h3 className="alert-section-title">Herd reports ({reports.length})</h3>
          <div className="alert-cards">
            {reports.slice(0, 20).map(r => (
              <div key={r.id} className="card alert-report-item">
                <span className="alert-report-dot" style={{ background: scoreColor(r.score) }} />
                <span className="alert-report-score">Score {r.score}</span>
                <span className="alert-report-meta">{r.species} x{r.animalCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}