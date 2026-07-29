export interface StressReport {
  id: string
  lat: number
  lng: number
  score: number
  animalCount: number
  species: string
  timestamp: string
  day: number
}

export interface AlertCluster {
  center: { lat: number; lng: number }
  avgScore: number
  herdCount: number
  radiusKm: number
  triggeredAt: string
  members: StressReport[]
}

const REPORTS: StressReport[] = [
  { id: 'r1', lat: 3.520, lng: 38.480, score: 72, animalCount: 15, species: 'cattle', timestamp: '2026-07-20T08:00:00Z', day: 0 },
  { id: 'r2', lat: 3.550, lng: 38.450, score: 68, animalCount: 12, species: 'cattle', timestamp: '2026-07-21T10:00:00Z', day: 1 },
  { id: 'r3', lat: 3.480, lng: 38.500, score: 75, animalCount: 20, species: 'goat', timestamp: '2026-07-22T06:00:00Z', day: 2 },
  { id: 'r4', lat: 3.600, lng: 38.520, score: 45, animalCount: 8, species: 'sheep', timestamp: '2026-07-22T14:00:00Z', day: 2 },
  { id: 'r5', lat: 3.450, lng: 38.420, score: 80, animalCount: 25, species: 'camel', timestamp: '2026-07-23T09:00:00Z', day: 3 },
  { id: 'r6', lat: 3.580, lng: 38.550, score: 60, animalCount: 10, species: 'cattle', timestamp: '2026-07-24T11:00:00Z', day: 4 },
  { id: 'r7', lat: 3.500, lng: 38.470, score: 82, animalCount: 18, species: 'goat', timestamp: '2026-07-25T07:00:00Z', day: 5 },
  { id: 'r8', lat: 3.530, lng: 38.440, score: 70, animalCount: 14, species: 'cattle', timestamp: '2026-07-26T16:00:00Z', day: 6 },
  { id: 'r9', lat: 3.470, lng: 38.490, score: 65, animalCount: 22, species: 'sheep', timestamp: '2026-07-27T08:00:00Z', day: 7 },
  { id: 'r10', lat: 3.560, lng: 38.460, score: 78, animalCount: 16, species: 'cattle', timestamp: '2026-07-28T10:00:00Z', day: 8 },
  { id: 'r11', lat: 3.510, lng: 38.430, score: 55, animalCount: 9, species: 'goat', timestamp: '2026-07-28T15:00:00Z', day: 8 },
  { id: 'r12', lat: 3.540, lng: 38.510, score: 85, animalCount: 30, species: 'cattle', timestamp: '2026-07-29T06:00:00Z', day: 9 },
  { id: 'r13', lat: 3.490, lng: 38.460, score: 62, animalCount: 11, species: 'camel', timestamp: '2026-07-29T12:00:00Z', day: 9 },
  { id: 'r14', lat: 3.570, lng: 38.480, score: 40, animalCount: 7, species: 'cattle', timestamp: '2026-07-29T14:00:00Z', day: 9 },
  { id: 'r15', lat: 3.460, lng: 38.440, score: 90, animalCount: 35, species: 'goat', timestamp: '2026-07-29T16:00:00Z', day: 9 }
]

export const NDVI_READINGS = [
  { date: '2026-07-20', ndvi: 0.48, day: 0 },
  { date: '2026-07-21', ndvi: 0.46, day: 1 },
  { date: '2026-07-22', ndvi: 0.45, day: 2 },
  { date: '2026-07-23', ndvi: 0.43, day: 3 },
  { date: '2026-07-24', ndvi: 0.42, day: 4 },
  { date: '2026-07-25', ndvi: 0.40, day: 5 },
  { date: '2026-07-26', ndvi: 0.38, day: 6 },
  { date: '2026-07-27', ndvi: 0.36, day: 7 },
  { date: '2026-07-28', ndvi: 0.33, day: 8 },
  { date: '2026-07-29', ndvi: 0.31, day: 9 },
  { date: '2026-07-30', ndvi: 0.28, day: 10 },
  { date: '2026-08-01', ndvi: 0.26, day: 12 },
  { date: '2026-08-03', ndvi: 0.24, day: 14 },
  { date: '2026-08-05', ndvi: 0.21, day: 16 },
  { date: '2026-08-07', ndvi: 0.19, day: 18 }
]

export const NDVI_THRESHOLD = 0.30

export function getReportsUpToDay(day: number): StressReport[] {
  return REPORTS.filter(r => r.day <= day)
}

export function getClusters(day: number, radiusKm = 15, minHerds = 3): AlertCluster[] {
  const active = getReportsUpToDay(day).filter(r => r.score > 60)
  const clusters: AlertCluster[] = []
  const assigned = new Set<string>()

  for (let i = 0; i < active.length; i++) {
    if (assigned.has(active[i].id)) continue
    const memberIds = new Set<string>()
    memberIds.add(active[i].id)

    for (let j = i + 1; j < active.length; j++) {
      if (assigned.has(active[j].id)) continue
      const dist = haversineKm(active[i].lat, active[i].lng, active[j].lat, active[j].lng)
      if (dist <= radiusKm) {
        memberIds.add(active[j].id)
      }
    }

    if (memberIds.size >= minHerds) {
      const members = active.filter(r => memberIds.has(r.id))
      for (const id of memberIds) assigned.add(id)
      clusters.push({
        center: {
          lat: members.reduce((a, c) => a + c.lat, 0) / members.length,
          lng: members.reduce((a, c) => a + c.lng, 0) / members.length
        },
        avgScore: Math.round(members.reduce((a, c) => a + c.score, 0) / members.length),
        herdCount: members.length,
        radiusKm,
        triggeredAt: new Date().toISOString(),
        members
      })
    }
  }

  return clusters
}

export function getNdviAtDay(day: number): number {
  const readings = NDVI_READINGS.filter(r => r.day <= day)
  if (readings.length === 0) return 0.50
  return readings[readings.length - 1].ndvi
}

export function getBreachDay(): number {
  for (const r of NDVI_READINGS) {
    if (r.ndvi < NDVI_THRESHOLD) return r.day
  }
  return 30
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
