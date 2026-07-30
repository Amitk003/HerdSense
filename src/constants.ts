export const FPS = 30

export const SCORE_LOW = 35
export const SCORE_HIGH = 65

export const CLUSTER_RADIUS_KM = 15
export const CLUSTER_MIN_HERDS = 3
export const CLUSTER_SCORE_THRESHOLD = 60

export const CONFIDENCE_THRESHOLD = 0.5
export const FRAME_SAMPLE_RATE = 3

export const MAX_CACHED_REPORTS = 50
export const MAX_HISTORY_RECORDS = 50

export const SPECIES_MAP: Record<number, string> = {
  19: 'cattle',
  20: 'sheep',
  21: 'goat',
  22: 'horse',
  23: 'camel',
  24: 'donkey'
}

export function speciesFromClassIds(classIds: number[]): string {
  const counts: Record<string, number> = {}
  for (const id of classIds) {
    const name = SPECIES_MAP[id]
    if (name) counts[name] = (counts[name] || 0) + 1
  }
  let best = 'cattle'
  let bestCount = 0
  for (const [name, count] of Object.entries(counts)) {
    if (count > bestCount) { best = name; bestCount = count }
  }
  return bestCount > 0 ? best : 'cattle'
}
