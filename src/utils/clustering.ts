import type { StressReport } from '../pipeline/types'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function haversineCluster(
  reports: StressReport[],
  radiusKm: number,
  minPoints: number
): StressReport[][] {
  const clusters: StressReport[][] = []
  const assigned = new Set<number>()

  for (let i = 0; i < reports.length; i++) {
    if (assigned.has(i)) continue

    const cluster: StressReport[] = [reports[i]]
    assigned.add(i)

    for (let j = i + 1; j < reports.length; j++) {
      if (assigned.has(j)) continue

      const dist = haversineKm(
        reports[i].lat, reports[i].lng,
        reports[j].lat, reports[j].lng
      )

      if (dist <= radiusKm) {
        cluster.push(reports[j])
        assigned.add(j)
      }
    }

    if (cluster.length >= minPoints) {
      clusters.push(cluster)
    }
  }

  return clusters
}
