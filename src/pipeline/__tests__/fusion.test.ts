import { describe, it, expect } from 'vitest'
import { calcHssi } from '../fusion'
import type { FrameFeatures, ScanRecord } from '../types'

describe('calcHssi', () => {
  it('returns zero score with no features', () => {
    const result = calcHssi([], 0, [])
    expect(result.score).toBe(0)
    expect(result.trend).toBe('stable')
    expect(result.recommendation).toContain('healthy')
  })

  it('returns high score with high feature values', () => {
    const features: FrameFeatures[] = [
      {
        frameIndex: 0,
        iasi: 50,
        centroids: [
          { x: 0, y: 0, animalId: 1 },
          { x: 20, y: 20, animalId: 2 },
          { x: 30, y: 30, animalId: 3 }
        ],
        speedStats: { meanSpeed: 10, speedVariance: 80, directionChangeFreq: 0.8 },
        aspectRatios: [1.5, 0.8, 1.2, 0.9]
      },
      {
        frameIndex: 3,
        iasi: 40,
        centroids: [
          { x: 0, y: 0, animalId: 1 },
          { x: 25, y: 25, animalId: 2 },
          { x: 35, y: 35, animalId: 3 }
        ],
        speedStats: { meanSpeed: 12, speedVariance: 90, directionChangeFreq: 0.7 },
        aspectRatios: [2.0, 0.5, 1.8, 0.5]
      }
    ]
    const result = calcHssi(features, 0.9, [])
    expect(result.score).toBeGreaterThan(60)
    expect(result.clustering).toBeGreaterThan(0)
    expect(result.motion).toBeGreaterThan(0)
    expect(result.posture).toBeGreaterThan(0)
    expect(result.audio).toBe(0.9)
  })

  it('returns escalating trend when score rising', () => {
    const history: ScanRecord[] = [
      { timestamp: '1', score: 30, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 },
      { timestamp: '2', score: 40, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 },
      { timestamp: '3', score: 50, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 },
      { timestamp: '4', score: 60, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 }
    ]
    const result = calcHssi([], 0, history)
    expect(result.trend).toBe('escalating')
  })

  it('returns improving trend when score falling', () => {
    const history: ScanRecord[] = [
      { timestamp: '1', score: 80, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 },
      { timestamp: '2', score: 70, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 },
      { timestamp: '3', score: 60, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 },
      { timestamp: '4', score: 50, clustering: 0, motion: 0, posture: 0, audio: 0, animalCount: 15 }
    ]
    const result = calcHssi([], 0, history)
    expect(result.trend).toBe('improving')
  })

  it('clamps audio to 0-1 range', () => {
    const resultHigh = calcHssi([], 2.5, [])
    const resultLow = calcHssi([], -1, [])
    expect(resultHigh.audio).toBe(1)
    expect(resultLow.audio).toBe(0)
  })
})
