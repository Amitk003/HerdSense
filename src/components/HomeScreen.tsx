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
      timestamp: new Date().toISOString()
    }

    saveRecord({
      timestamp: final.timestamp,
      score: final.score,
      clustering: final.clustering,
      motion: final.motion,
      posture: final.posture,
      audio: final.audio,
      animalCount: 15
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
            <ScoreDial score={lastScore} size={48} />
          </div>
        </div>
      )}

      <section className="presets-section">
        <h2 className="section-title">Demo presets</h2>
        <div className="presets-grid">
          {DEMO_PRESETS.map(preset => (
            <button
              key={preset.id}
              className={`preset-card preset-${preset.id}`}
              onClick={() => handlePreset(preset)}
            >
              <span className="preset-label">{preset.label}</span>
              <ScoreDial score={preset.precomputedScore} size={64} />
              <span className="preset-desc">{preset.description}</span>
            </button>
          ))}
        </div>
      </section>

      <nav className="home-nav">
        <button className="nav-btn nav-btn-primary" onClick={onNavigateCamera}>
          Record New
        </button>
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