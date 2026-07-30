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
  const history = loadHistory()
  const lastScore = history.length > 0 ? history[0].score : null

  const handlePreset = async (preset: DemoPreset) => {
    setLoading(true)

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
          <div className="loading-spinner" />
          <p>Analyzing herd video...</p>
        </div>
      )}
      <header className="home-header">
        <h1 className="app-title">HerdSense</h1>
        <p className="app-subtitle">Livestock stress detection</p>
      </header>

      {lastScore !== null && (
        <div className="last-scan-card" onClick={onNavigateHistory}>
          <span className="last-scan-label">Last scan</span>
          <div className="last-scan-score">
            <ScoreDial score={lastScore} size={40} />
          </div>
        </div>
      )}

      <div className="home-cta">
        <button className="record-btn-big" onClick={onNavigateCamera}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Record New
        </button>
      </div>

      <section className="presets-section">
        <h2 className="section-title">Demo presets</h2>
        <div className="presets-grid">
          {DEMO_PRESETS.map(preset => (
            <button
              key={preset.id}
              className={`preset-card preset-${preset.id}`}
              onClick={() => handlePreset(preset)}
            >
              <ScoreDial score={preset.precomputedScore} size={56} />
              <div className="preset-info">
                <span className="preset-label">{preset.label}</span>
                <span className="preset-desc">{preset.description}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <nav className="home-nav">
        <button className="nav-btn" onClick={onNavigateMap}>
          View Regional Map
        </button>
        <button className="nav-btn" onClick={onNavigateHistory}>
          View History
        </button>
      </nav>
    </div>
  )
}