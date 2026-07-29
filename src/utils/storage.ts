import type { ScanRecord } from '../pipeline/types'

const STORAGE_KEY = 'herdsense_history'
const MAX_RECORDS = 50

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

  const trimmed = history.slice(0, MAX_RECORDS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return trimmed
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
