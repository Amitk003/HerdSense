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
