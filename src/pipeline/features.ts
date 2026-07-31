import type { Centroid, FrameFeatures, SpeedStats, DetectionFrame } from './types'
import { Tracker } from './tracker'
import { FRAME_SAMPLE_RATE } from '../constants'

export class FeatureExtractor {
  private tracker = new Tracker()
  private prevCentroids: Map<number, { x: number; y: number }> = new Map()
  private prevAngles: Map<number, number> = new Map()
  private totalDisplacements = 0
  private totalDirectionChanges = 0

  extract(
    _video: HTMLVideoElement,
    frames: DetectionFrame[],
    _totalFrames: number
  ): FrameFeatures[] {
    this.tracker.reset()
    this.prevCentroids.clear()
    this.prevAngles.clear()
    this.totalDisplacements = 0
    this.totalDirectionChanges = 0

    const centroidsByFrame = this.tracker.trackAcrossFrames(frames)
    const featureFrames: FrameFeatures[] = []

    for (let fi = 0; fi < frames.length; fi++) {
      const frame = frames[fi]
      const centroids = centroidsByFrame[fi] || []

      const iasi = this.calcIasi(centroids)
      const speedStats = this.calcSpeedStats(centroids)
      const aspectRatios = frame.boxes.map(
        b => (b.width > 0 ? b.height / b.width : 1)
      )

      featureFrames.push({
        frameIndex: frame.frameIndex,
        iasi,
        centroids,
        speedStats,
        aspectRatios
      })
    }

    return featureFrames
  }

  private calcIasi(centroids: Centroid[]): number {
    if (centroids.length < 2) return 0

    let totalDist = 0
    let pairs = 0

    for (let i = 0; i < centroids.length; i++) {
      for (let j = i + 1; j < centroids.length; j++) {
        const dx = centroids[i].x - centroids[j].x
        const dy = centroids[i].y - centroids[j].y
        totalDist += Math.sqrt(dx * dx + dy * dy)
        pairs++
      }
    }

    return pairs > 0 ? totalDist / pairs : 0
  }

  private calcSpeedStats(centroids: Centroid[]): SpeedStats | null {
    const currentMap = new Map(centroids.map(c => [c.animalId, { x: c.x, y: c.y }]))
    const speeds: number[] = []

    for (const [id, curr] of currentMap) {
      const prev = this.prevCentroids.get(id)
      if (!prev) continue

      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      const rawDist = Math.sqrt(dx * dx + dy * dy)
      const speed = rawDist * (3 / FRAME_SAMPLE_RATE)
      const angle = Math.atan2(dy, dx)

      speeds.push(speed)

      const prevAngle = this.prevAngles.get(id)
      if (prevAngle !== undefined) {
        const angleDiff = Math.abs(angle - prevAngle)
        if (angleDiff > Math.PI / 4) {
          this.totalDirectionChanges++
        }
      }
      this.prevAngles.set(id, angle)
      this.totalDisplacements++
    }

    this.prevCentroids = currentMap

    if (speeds.length === 0) return null

    const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length
    const speedVariance = speeds.reduce((sum, s) => sum + (s - meanSpeed) ** 2, 0) / speeds.length

    return {
      meanSpeed,
      speedVariance,
      directionChangeFreq: this.totalDisplacements > 0
        ? this.totalDirectionChanges / this.totalDisplacements
        : 0
    }
  }

  reset(): void {
    this.tracker.reset()
    this.prevCentroids.clear()
    this.prevAngles.clear()
    this.totalDisplacements = 0
    this.totalDirectionChanges = 0
  }
}
