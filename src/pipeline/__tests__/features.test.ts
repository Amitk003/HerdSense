import { describe, it, expect, beforeEach } from 'vitest'
import { FeatureExtractor } from '../features'
import type { DetectionFrame } from '../types'

describe('FeatureExtractor', () => {
  let extractor: FeatureExtractor

  beforeEach(() => {
    extractor = new FeatureExtractor()
  })

  it('returns empty features for empty frames', () => {
    const frames: DetectionFrame[] = [
      { frameIndex: 0, boxes: [] }
    ]
    const result = extractor.extract(null as any, frames, 1)
    expect(result.length).toBe(1)
    expect(result[0].iasi).toBe(1)
    expect(result[0].speedStats).toBeNull()
    expect(result[0].aspectRatios).toEqual([])
  })

  it('computes IASI for multiple detections', () => {
    const frames: DetectionFrame[] = [
      {
        frameIndex: 0,
        boxes: [
          { x: 0, y: 0, width: 20, height: 20, confidence: 0.9, animalId: -1 },
          { x: 100, y: 0, width: 20, height: 20, confidence: 0.9, animalId: -1 },
          { x: 50, y: 100, width: 20, height: 20, confidence: 0.9, animalId: -1 }
        ]
      }
    ]
    const result = extractor.extract(null as any, frames, 1)
    expect(result[0].iasi).toBeGreaterThan(80)
    expect(result[0].iasi).toBeLessThan(120)
  })

  it('resets properly between extractions', () => {
    const frames: DetectionFrame[] = [
      { frameIndex: 0, boxes: [] }
    ]
    extractor.extract(null as any, frames, 1)
    extractor.reset()
    const result = extractor.extract(null as any, frames, 1)
    expect(result.length).toBe(1)
  })
})
