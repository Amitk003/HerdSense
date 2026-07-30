import type { ScanRecord } from '../pipeline/types'
import { MAX_HISTORY_RECORDS } from '../constants'

const STORAGE_KEY = 'herdsense_history'

export function loadHistory(): ScanRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveRecord(record: ScanRecord): ScanRecord[] {
  const history = loadHistory()
  history.unshift(record)

  let trimmed = history.slice(0, MAX_HISTORY_RECORDS)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (err) {
    console.warn('Storage quota exceeded, pruning history records:', err)
    while (trimmed.length > 5) {
      trimmed.pop()
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
        break
      } catch {
        // continue pruning
      }
    }
  }
  return trimmed
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
