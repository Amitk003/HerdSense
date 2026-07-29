import type { FrameFeatures, HerdStressResult, ScanRecord } from './types'

const CLUSTER_WEIGHT = 0.35
const MOTION_WEIGHT = 0.25
const POSTURE_WEIGHT = 0.20
const AUDIO_WEIGHT = 0.20

export function calcHssi(
  features: FrameFeatures[],
  audioDistress: number,
  history: ScanRecord[]
): HerdStressResult {
  const clusteringScore = calcClusteringScore(features)
  const motionScore = calcMotionScore(features)
  const postureScore = calcPostureScore(features)
  const audioScore = Math.max(0, Math.min(1, audioDistress))

  const rawScore =
    CLUSTER_WEIGHT * clusteringScore +
    MOTION_WEIGHT * motionScore +
    POSTURE_WEIGHT * postureScore +
    AUDIO_WEIGHT * audioScore

  const score = Math.round(Math.max(0, Math.min(100, rawScore * 100)))
  const trend = calcTrend(score, history)
  const recommendation = getRecommendation(score, trend)

  return {
    score,
    clustering: Math.round(clusteringScore * 100) / 100,
    motion: Math.round(motionScore * 100) / 100,
    posture: Math.round(postureScore * 100) / 100,
    audio: Math.round(audioScore * 100) / 100,
    trend,
    recommendation,
    timestamp: new Date().toISOString()
  }
}

function calcClusteringScore(features: FrameFeatures[]): number {
  if (features.length === 0) return 0

  const iasiValues = features.filter(f => f.iasi > 0).map(f => f.iasi)
  if (iasiValues.length === 0) return 0

  const meanIasi = iasiValues.reduce((a, b) => a + b, 0) / iasiValues.length
  const maxExpectedIasi = 500
  const normalizedIasi = Math.min(1, meanIasi / maxExpectedIasi)

  return 1 - normalizedIasi
}

function calcMotionScore(features: FrameFeatures[]): number {
  const speedStats = features
    .map(f => f.speedStats)
    .filter((s): s is NonNullable<typeof s> => s !== null)

  if (speedStats.length === 0) return 0

  const meanVariance = speedStats.reduce((a, b) => a + b.speedVariance, 0) / speedStats.length
  const meanDirChanges = speedStats.reduce((a, b) => a + b.directionChangeFreq, 0) / speedStats.length

  const varianceScore = Math.min(1, meanVariance / 100)
  const directionScore = Math.min(1, meanDirChanges * 5)

  return (varianceScore + directionScore) / 2
}

function calcPostureScore(features: FrameFeatures[]): number {
  const ratios = features.flatMap(f => f.aspectRatios)
  if (ratios.length < 3) return 0

  const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length
  const variance = ratios.reduce((sum, r) => sum + (r - mean) ** 2, 0) / ratios.length

  return Math.min(1, variance * 10)
}

function calcTrend(currentScore: number, history: ScanRecord[]): 'improving' | 'stable' | 'escalating' {
  const recent = history.slice(-4)
  if (recent.length < 2) return 'stable'

  const scores = recent.map(r => r.score)
  const indices = scores.map((_, i) => i)
  const n = indices.length

  const sumX = indices.reduce((a, b) => a + b, 0)
  const sumY = scores.reduce((a, b) => a + b, 0)
  const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0)
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

  if (Math.abs(slope) < 2) return 'stable'
  return slope > 0 ? 'escalating' : 'improving'
}

function getRecommendation(score: number, trend: string): string {
  if (score < 35) {
    return 'Normal conditions. Continue standard grazing schedule.'
  }

  if (score < 65) {
    if (trend === 'escalating') {
      return 'Moderate stress escalating. Consider moving herd toward water within 4 days.'
    }
    return 'Moderate stress detected. Monitor regularly.'
  }

  if (trend === 'escalating') {
    return 'Critical stress escalating. Activate forage reserves or begin migration immediately.'
  }

  return 'High stress detected. Consider moving herd or releasing forage reserves.'
}
