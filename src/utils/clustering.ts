export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function findClusters<T extends { lat: number; lng: number }>(
  points: T[],
  radiusKm: number,
  minPoints: number
): T[][] {
  const clusters: T[][] = []
  const assigned = new Set<number>()

  for (let i = 0; i < points.length; i++) {
    if (assigned.has(i)) continue
    const cluster: T[] = [points[i]]
    assigned.add(i)

    for (let j = i + 1; j < points.length; j++) {
      if (assigned.has(j)) continue
      const dist = haversineKm(
        points[i].lat, points[i].lng,
        points[j].lat, points[j].lng
      )
      if (dist <= radiusKm) {
        cluster.push(points[j])
        assigned.add(j)
      }
    }

    if (cluster.length >= minPoints) {
      clusters.push(cluster)
    }
  }

  return clusters
}

import type { StressReport, AlertCluster } from '../pipeline/types'

export function findAlertClusters(
  reports: StressReport[],
  radiusKm = 15,
  minHerds = 3,
  scoreThreshold = 60
): AlertCluster[] {
  const highStress = reports.filter(r => r.score > scoreThreshold)
  const clusters: AlertCluster[] = []
  const assigned = new Set<string>()

  for (let i = 0; i < highStress.length; i++) {
    if (assigned.has(highStress[i].id)) continue
    const memberIds = new Set<string>()
    memberIds.add(highStress[i].id)

    for (let j = i + 1; j < highStress.length; j++) {
      if (assigned.has(highStress[j].id)) continue
      const dist = haversineKm(
        highStress[i].lat, highStress[i].lng,
        highStress[j].lat, highStress[j].lng
      )
      if (dist <= radiusKm) {
        memberIds.add(highStress[j].id)
      }
    }

    if (memberIds.size >= minHerds) {
      const members = highStress.filter(r => memberIds.has(r.id))
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
