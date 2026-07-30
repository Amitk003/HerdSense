import { describe, it, expect } from 'vitest'
import { Tracker } from '../tracker'
import type { DetectionFrame } from '../types'

describe('Tracker', () => {
  it('assigns IDs across frames', () => {
    const tracker = new Tracker()
    const frames: DetectionFrame[] = [
      {
        frameIndex: 0,
        boxes: [
          { x: 10, y: 10, width: 50, height: 50, confidence: 0.9, classId: 19, animalId: -1 },
          { x: 100, y: 100, width: 50, height: 50, confidence: 0.8, classId: 19, animalId: -1 }
        ]
      }
    ]
    const centroids = tracker.trackAcrossFrames(frames)
    expect(centroids.length).toBe(1)
    expect(centroids[0].length).toBe(2)
    expect(centroids[0][0].animalId).toBeGreaterThan(0)
    expect(centroids[0][1].animalId).toBeGreaterThan(0)
  })

  it('reuses IDs for overlapping boxes across frames', () => {
    const tracker = new Tracker()
    const frames: DetectionFrame[] = [
      {
        frameIndex: 0,
        boxes: [
          { x: 10, y: 10, width: 50, height: 50, confidence: 0.9, classId: 19, animalId: -1 }
        ]
      },
      {
        frameIndex: 1,
        boxes: [
          { x: 12, y: 12, width: 50, height: 50, confidence: 0.9, classId: 19, animalId: -1 }
        ]
      }
    ]
    const centroids = tracker.trackAcrossFrames(frames)
    expect(centroids[0][0].animalId).toBe(centroids[1][0].animalId)
  })

  it('resets state', () => {
    const tracker = new Tracker()
    const frames: DetectionFrame[] = [
      {
        frameIndex: 0,
        boxes: [
          { x: 10, y: 10, width: 50, height: 50, confidence: 0.9, classId: 19, animalId: -1 }
        ]
      }
    ]
    tracker.trackAcrossFrames(frames)
    tracker.reset()
    const centroids = tracker.trackAcrossFrames(frames)
    expect(centroids[0][0].animalId).toBeGreaterThan(0)
  })
})
