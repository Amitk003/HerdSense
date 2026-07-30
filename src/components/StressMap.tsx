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
    const timeout = setTimeout(() => setTileError(true), 8000)
    map.on('tileload', () => setTileError(false))
    return () => clearTimeout(timeout)
  }, [map])

  if (tileError) {
    return (
      <div className="map-tile-overlay">
        <span>Map tiles unavailable offline.</span>
        <span className="map-tile-overlay-sub">Report markers still show.</span>
      </div>
    )
  }

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

  return null
}

interface StressMapProps {
  onBack?: () => void
  reports?: StressReport[]
  focusedReportId?: string | null
  onClusterAlert?: (cluster: AlertCluster) => void
}

export default function StressMap({ onBack, reports = [], focusedReportId, onClusterAlert }: StressMapProps) {
  const [tilesLoaded, setTilesLoaded] = useState(false)

  const clusters: AlertCluster[] = useMemo(() => findAlertClusters(reports), [reports])

  const center: [number, number] = reports.length > 0
    ? [reports[0].lat, reports[0].lng]
    : [0, 20]

  const highStressCount = reports.filter(r => r.score > 60).length

  return (
    <div className="screen map-screen">
      <div className="map-body">
        {reports.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="empty-state-title">No reports yet</span>
            <span className="empty-state-sub">Share a scan to see reports on the map</span>
          </div>
        ) : (
          <>
            <MapContainer center={center} zoom={10} className="map-container" zoomControl={false}>
              <MapController
                focusedReportId={focusedReportId ?? null}
                reports={reports}
                onClusterAlert={onClusterAlert}
              />
              {!tilesLoaded && (
                <div className="map-tile-overlay">Loading map tiles...</div>
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
          </>
        )}
      </div>

      {reports.length > 0 && clusters.length > 0 && (
        <div className="alert-section">
          <h3 className="alert-section-title">Active alerts</h3>
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