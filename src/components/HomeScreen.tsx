import { useState } from 'react'
import { DEMO_PRESETS } from '../data/presets'
import { calcHssi } from '../pipeline/fusion'
import { saveRecord, loadHistory } from '../utils/storage'
import type { HerdStressResult, DemoPreset, FrameFeatures } from '../pipeline/types'
import ScoreDial from './ScoreDial'

interface HomeScreenProps {
  onPresetSelected: (result: HerdStressResult) => void
  onNavigateCamera: () => void
  onNavigateMap: () => void
  onNavigateHistory: () => void
}

export default function HomeScreen({ onPresetSelected, onNavigateCamera, onNavigateMap, onNavigateHistory }: HomeScreenProps) {
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const history = loadHistory()
  const lastScore = history.length > 0 ? history[0].score : null

  const handlePreset = async (preset: DemoPreset) => {
    setLoading(true)
    setShowDemo(false)

    const h = loadHistory()
    const result = calcHssi(
      [] as FrameFeatures[],
      preset.precomputedSubscores.audio,
      h
    )

    const final: HerdStressResult = {
      ...result,
      timestamp: new Date().toISOString(),
      animalCount: preset.animalCount,
      species: preset.species
    }

    saveRecord({
      timestamp: final.timestamp,
      score: final.score,
      clustering: final.clustering,
      motion: final.motion,
      posture: final.posture,
      audio: final.audio,
      animalCount: final.animalCount
    })

    setLoading(false)
    onPresetSelected(final)
  }

  return (
    <div className="screen home-screen">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Analyzing herd video...</p>
        </div>
      )}

      <div className="home-header">
        <h1 className="app-title">HerdSense</h1>
        <p className="app-subtitle">Livestock stress detection</p>
      </div>

      <div className="home-cta">
        <button className="record-btn-big" onClick={onNavigateCamera}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Record New
        </button>
        <button className="home-quick-btn" onClick={onNavigateMap} aria-label="Map">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </button>
      </div>

      {lastScore !== null && (
        <div className="card last-scan-card" onClick={onNavigateHistory}>
          <span className="last-scan-label">Last scan</span>
          <div className="last-scan-score">
            <ScoreDial score={lastScore} size={40} />
          </div>
        </div>
      )}

      <div className="demo-trigger">
        <button className="demo-btn" onClick={() => setShowDemo(!showDemo)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Demo
        </button>
        {showDemo && (
          <div className="demo-panel">
            {DEMO_PRESETS.map(p => {
              const colors: Record<string, string> = { healthy: 'var(--success)', 'early-stress': 'var(--warning)', critical: 'var(--danger)' }
              return (
                <button key={p.id} className="demo-opt" onClick={() => handlePreset(p)}>
                  <span className="demo-opt-score" style={{ color: colors[p.id] }}>{p.precomputedScore}</span>
                  <span className="demo-opt-label">{p.label}</span>
                  <span className="demo-opt-arrow">&rarr;</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="home-nav">
        <div className="card" onClick={onNavigateHistory}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 6px' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          History
        </div>
        <div className="card" onClick={onNavigateMap}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 6px' }}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          Map
        </div>
      </div>
    </div>
  )
}