export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  animalId: number
}

export interface DetectionFrame {
  frameIndex: number
  boxes: BoundingBox[]
}

export interface Centroid {
  x: number
  y: number
  animalId: number
}

export interface FrameFeatures {
  frameIndex: number
  iasi: number
  centroids: Centroid[]
  speedStats: SpeedStats | null
  aspectRatios: number[]
}

export interface SpeedStats {
  meanSpeed: number
  speedVariance: number
  directionChangeFreq: number
}

export interface HerdStressResult {
  score: number
  clustering: number
  motion: number
  posture: number
  audio: number
  trend: 'improving' | 'stable' | 'escalating'
  recommendation: string
  timestamp: string
}

export interface ScanRecord {
  timestamp: string
  score: number
  clustering: number
  motion: number
  posture: number
  audio: number
  animalCount: number
}

export interface DemoPreset {
  id: string
  label: string
  description: string
  videoFile: string
  precomputedScore: number
  precomputedSubscores: {
    clustering: number
    motion: number
    posture: number
    audio: number
  }
}

export interface StressReport {
  id: string
  lat: number
  lng: number
  score: number
  animalCount: number
  species: string
  timestamp: string
}

export interface AlertCluster {
  center: { lat: number; lng: number }
  avgScore: number
  herdCount: number
  radiusKm: number
  triggeredAt: string
  members: StressReport[]
}

export interface NdviReading {
  date: string
  ndvi: number
}
