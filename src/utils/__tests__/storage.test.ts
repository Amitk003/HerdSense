import { describe, it, expect, beforeEach } from 'vitest'
import { loadHistory, saveRecord, clearHistory } from '../storage'
import type { ScanRecord } from '../../pipeline/types'

const store: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => {
    for (const k of Object.keys(store)) delete store[k]
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return an empty array when no history is stored', () => {
    expect(loadHistory()).toEqual([])
  })

  it('should save a record and retrieve it', () => {
    const record: ScanRecord = {
      timestamp: '2026-07-30T10:00:00Z',
      score: 45,
      clustering: 0.4,
      motion: 0.5,
      posture: 0.3,
      audio: 0,
      animalCount: 10
    }

    const updated = saveRecord(record)
    expect(updated).toHaveLength(1)
    expect(updated[0]).toEqual(record)

    const loaded = loadHistory()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].score).toBe(45)
  })

  it('should clear stored history', () => {
    saveRecord({
      timestamp: '2026-07-30T10:00:00Z',
      score: 30,
      clustering: 0.2,
      motion: 0.3,
      posture: 0.2,
      audio: 0,
      animalCount: 5
    })

    clearHistory()
    expect(loadHistory()).toEqual([])
  })
})
