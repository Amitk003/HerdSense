import type { StressReport, Alert } from '../pipeline/types'
import { haversineCluster } from '../utils/clustering'

const MOCK_REPORTS: StressReport[] = [
  { lat: 3.52, lng: 38.48, score: 72, animalCount: 15, species: 'cattle', timestamp: '2026-07-20T08:00:00Z' },
  { lat: 3.55, lng: 38.45, score: 68, animalCount: 12, species: 'cattle', timestamp: '2026-07-21T10:00:00Z' },
  { lat: 3.48, lng: 38.50, score: 75, animalCount: 20, species: 'goat', timestamp: '2026-07-22T06:00:00Z' },
  { lat: 3.60, lng: 38.52, score: 45, animalCount: 8, species: 'cattle', timestamp: '2026-07-22T14:00:00Z' },
  { lat: 3.45, lng: 38.42, score: 80, animalCount: 25, species: 'camel', timestamp: '2026-07-23T09:00:00Z' },
  { lat: 3.58, lng: 38.55, score: 60, animalCount: 10, species: 'cattle', timestamp: '2026-07-24T11:00:00Z' },
  { lat: 3.50, lng: 38.47, score: 82, animalCount: 18, species: 'goat', timestamp: '2026-07-25T07:00:00Z' },
  { lat: 3.53, lng: 38.44, score: 70, animalCount: 14, species: 'cattle', timestamp: '2026-07-26T16:00:00Z' },
  { lat: 3.47, lng: 38.49, score: 65, animalCount: 22, species: 'sheep', timestamp: '2026-07-27T08:00:00Z' },
  { lat: 3.56, lng: 38.46, score: 78, animalCount: 16, species: 'cattle', timestamp: '2026-07-28T10:00:00Z' },
  { lat: 3.51, lng: 38.43, score: 55, animalCount: 9, species: 'goat', timestamp: '2026-07-28T15:00:00Z' },
  { lat: 3.54, lng: 38.51, score: 85, animalCount: 30, species: 'cattle', timestamp: '2026-07-29T06:00:00Z' },
  { lat: 3.49, lng: 38.46, score: 62, animalCount: 11, species: 'camel', timestamp: '2026-07-29T12:00:00Z' },
  { lat: 3.57, lng: 38.48, score: 40, animalCount: 7, species: 'cattle', timestamp: '2026-07-29T14:00:00Z' },
  { lat: 3.46, lng: 38.44, score: 90, animalCount: 35, species: 'goat', timestamp: '2026-07-29T16:00:00Z' }
]

export interface AggregatedData {
  reports: StressReport[]
  alerts: Alert[]
}

export function getAggregatedData(radiusKm = 15, minScore = 60, minHerds = 3): AggregatedData {
  const highStress = MOCK_REPORTS.filter(r => r.score > minScore)
  const clusters = haversineCluster(highStress, radiusKm, minHerds)

  const alerts: Alert[] = clusters.map(cluster => ({
    center: {
      lat: cluster.reduce((a, c) => a + c.lat, 0) / cluster.length,
      lng: cluster.reduce((a, c) => a + c.lng, 0) / cluster.length
    },
    avgScore: Math.round(cluster.reduce((a, c) => a + c.score, 0) / cluster.length),
    herdCount: cluster.length,
    radiusKm,
    triggeredAt: new Date().toISOString()
  }))

  return { reports: MOCK_REPORTS, alerts }
}
