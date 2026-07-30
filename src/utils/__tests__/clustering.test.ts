import { describe, it, expect } from 'vitest'
import { haversineKm, findClusters } from '../clustering'

describe('haversineKm', () => {
  it('returns zero for same point', () => {
    expect(haversineKm(0, 0, 0, 0)).toBe(0)
  })

  it('returns ~111km for 1 degree latitude', () => {
    const dist = haversineKm(0, 0, 1, 0)
    expect(dist).toBeGreaterThan(110)
    expect(dist).toBeLessThan(112)
  })

  it('is symmetric', () => {
    const a = haversineKm(3.5, 38.5, 3.6, 38.6)
    const b = haversineKm(3.6, 38.6, 3.5, 38.5)
    expect(Math.abs(a - b)).toBeLessThan(0.001)
  })
})

describe('findClusters', () => {
  it('returns empty when no points', () => {
    expect(findClusters([], 10, 2)).toEqual([])
  })

  it('clusters nearby points', () => {
    const points = [
      { lat: 3.5, lng: 38.5 },
      { lat: 3.51, lng: 38.51 },
      { lat: 3.52, lng: 38.52 },
      { lat: 5.0, lng: 40.0 }
    ]
    const clusters = findClusters(points, 15, 2)
    expect(clusters.length).toBe(1)
    expect(clusters[0].length).toBeGreaterThanOrEqual(3)
  })
})
