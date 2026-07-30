import type { BoundingBox, Centroid, DetectionFrame } from './types'

const IOU_THRESHOLD = 0.3
const MAX_FRAME_GAP = 5

export class Tracker {
  private nextId = 1
  private activeTracks: Map<number, BoundingBox> = new Map()
  private frameGap: Map<number, number> = new Map()

  trackAcrossFrames(frames: DetectionFrame[]): Centroid[][] {
    const centroidsByFrame: Centroid[][] = []

    for (const frame of frames) {
      this.assignIds(frame.boxes)
      this.cleanupStaleTracks(frame.frameIndex)

      const centroids: Centroid[] = []
      for (const box of frame.boxes) {
        centroids.push({
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
          animalId: box.animalId
        })
      }
      centroidsByFrame.push(centroids)
    }

    return centroidsByFrame
  }

  private assignIds(boxes: BoundingBox[]): void {
    const assigned = new Set<number>()

    for (const box of boxes) {
      let bestMatch = -1
      let bestIou = IOU_THRESHOLD

      for (const [id, prevBox] of this.activeTracks) {
        const iou = this.calcIoU(box, prevBox)
        if (iou > bestIou) {
          bestIou = iou
          bestMatch = id
        }
      }

      if (bestMatch !== -1) {
        box.animalId = bestMatch
        this.activeTracks.set(bestMatch, box)
        this.frameGap.set(bestMatch, 0)
        assigned.add(bestMatch)
      } else {
        const newId = this.nextId++
        box.animalId = newId
        this.activeTracks.set(newId, box)
        this.frameGap.set(newId, 0)
        assigned.add(newId)
      }
    }

    for (const [id] of this.activeTracks) {
      if (!assigned.has(id)) {
        this.frameGap.set(id, (this.frameGap.get(id) || 0) + 1)
      }
    }
  }

  private cleanupStaleTracks(_currentFrame: number): void {
    for (const [id, gap] of this.frameGap) {
      if (gap > MAX_FRAME_GAP) {
        this.activeTracks.delete(id)
        this.frameGap.delete(id)
      }
    }
  }

  private calcIoU(a: BoundingBox, b: BoundingBox): number {
    const ax1 = a.x, ay1 = a.y, ax2 = a.x + a.width, ay2 = a.y + a.height
    const bx1 = b.x, by1 = b.y, bx2 = b.x + b.width, by2 = b.y + b.height

    const xi1 = Math.max(ax1, bx1)
    const yi1 = Math.max(ay1, by1)
    const xi2 = Math.min(ax2, bx2)
    const yi2 = Math.min(ay2, by2)

    const interArea = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1)
    const aArea = a.width * a.height
    const bArea = b.width * b.height
    const unionArea = aArea + bArea - interArea

    return unionArea > 0 ? interArea / unionArea : 0
  }

  reset(): void {
    this.nextId = 1
    this.activeTracks.clear()
    this.frameGap.clear()
  }
}
