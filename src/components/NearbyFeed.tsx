import { useState, useMemo } from 'react'
import type { StressReport } from '../pipeline/types'
import { haversineKm } from '../utils/clustering'
import { SCORE_LOW, SCORE_HIGH } from '../constants'

function scoreColor(s: number): string {
  if (s < SCORE_LOW) return '#84cc16'
  if (s < SCORE_HIGH) return '#d97706'
  return '#b91c1c'
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface NearbyFeedProps {
  reports: StressReport[]
  location: { lat: number; lng: number } | null
  onSelect: (report: StressReport) => void
}

export default function NearbyFeed({ reports, location, onSelect }: NearbyFeedProps) {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<'all' | 'high'>('all')

  const filtered = useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    if (filter === 'high') return sorted.filter(r => r.score > 60)
    return sorted
  }, [reports, filter])

  if (reports.length === 0) return null

  const highCount = reports.filter(r => r.score > 60).length

  return (
    <div className={`nearby-feed ${expanded ? 'expanded' : ''}`}>
      <div className="feed-handle" />
      <div className="feed-header" onClick={() => setExpanded(!expanded)}>
        <div className="feed-header-left">
          <span className="feed-title">Nearby</span>
          <span className="feed-summary">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
            {highCount > 0 && (
              <span className="feed-high-badge">{highCount} high</span>
            )}
          </span>
        </div>
        <span className="feed-toggle">{expanded ? 'Hide' : 'Show'}</span>
      </div>

      {expanded && (
        <div className="feed-body">
          <div className="feed-filters">
            <button
              className={`feed-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`feed-filter-btn ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              High stress
            </button>
          </div>

          <div className="feed-list">
            {filtered.map(r => {
              const dist = location
                ? Math.round(haversineKm(location.lat, location.lng, r.lat, r.lng) * 10) / 10
                : null
              const isHigh = r.score > 60

              return (
                <div
                  key={r.id}
                  className={`feed-item${isHigh ? ' feed-item-high' : ''}`}
                  onClick={() => onSelect(r)}
                >
                  {isHigh && <div className="feed-item-accent" />}
                  <span
                    className="feed-score-badge"
                    style={{ background: scoreColor(r.score) }}
                  >
                    {r.score}
                  </span>
                  <div className="feed-item-info">
                    <span className="feed-item-species">
                      {r.species} x{r.animalCount}
                    </span>
                    <span className="feed-item-meta">
                      {dist !== null ? `${dist}km away` : ''}
                      {dist !== null ? ' \u00b7 ' : ''}
                      {timeAgo(r.timestamp)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}