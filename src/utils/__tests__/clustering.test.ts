import { describe, it, expect } from 'vitest'
import { haversineKm, findClusters, findAlertClusters } from '../clustering'

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

describe('findAlertClusters', () => {
  const makeReport = (id: string, lat: number, lng: number, score: number) => ({
    id,
    lat,
    lng,
    score,
    animalCount: 10,
    species: 'cattle',
    timestamp: '2026-07-30T12:00:00Z'
  })

  it('returns empty for no reports', () => {
    expect(findAlertClusters([])).toEqual([])
  })

  it('returns empty when reports have low scores', () => {
    const reports = [
      makeReport('a', 3.5, 38.5, 30),
      makeReport('b', 3.51, 38.51, 40),
      makeReport('c', 3.52, 38.52, 50)
    ]
    expect(findAlertClusters(reports)).toEqual([])
  })

  it('creates cluster for nearby high-stress reports', () => {
    const reports = [
      makeReport('a', 3.5, 38.5, 80),
      makeReport('b', 3.51, 38.51, 75),
      makeReport('c', 3.52, 38.52, 70)
    ]
    const clusters = findAlertClusters(reports)
    expect(clusters.length).toBe(1)
    expect(clusters[0].herdCount).toBe(3)
    expect(clusters[0].avgScore).toBeGreaterThan(70)
  })

  it('does not cluster far apart reports', () => {
    const reports = [
      makeReport('a', 3.5, 38.5, 80),
      makeReport('b', 10.0, 50.0, 85),
      makeReport('c', 3.52, 38.52, 75)
    ]
    const clusters = findAlertClusters(reports)
    expect(clusters.length).toBe(0)
  })
})
