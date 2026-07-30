import { DEMO_PRESETS } from '../data/presets'
import { calcHssi } from '../pipeline/fusion'
import { saveRecord, loadHistory } from '../utils/storage'
import type { HerdStressResult, DemoPreset, FrameFeatures } from '../pipeline/types'
import ScoreDial from './ScoreDial'

interface HomeScreenProps {
  onPresetSelected: (result: HerdStressResult) => void
  onNavigateMap: () => void
  onNavigateHistory: () => void
}

export default function HomeScreen({ onPresetSelected, onNavigateMap, onNavigateHistory }: HomeScreenProps) {
  const history = loadHistory()
  const lastScore = history.length > 0 ? history[0].score : null

  const handlePreset = (preset: DemoPreset) => {
    const history = loadHistory()

    const result = calcHssi(
      [] as FrameFeatures[],
      preset.precomputedSubscores.audio,
      history
    )

    const finalResult: HerdStressResult = {
      ...result,
      score: preset.precomputedScore,
      clustering: preset.precomputedSubscores.clustering,
      motion: preset.precomputedSubscores.motion,
      posture: preset.precomputedSubscores.posture,
      audio: preset.precomputedSubscores.audio,
      timestamp: new Date().toISOString()
    }

    saveRecord({
      timestamp: finalResult.timestamp,
      score: finalResult.score,
      clustering: finalResult.clustering,
      motion: finalResult.motion,
      posture: finalResult.posture,
      audio: finalResult.audio,
      animalCount: 15
    })

    onPresetSelected(finalResult)
  }

  return (
    <div className="screen home-screen">
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
        <button className="nav-btn nav-btn-primary" onClick={() => alert('Camera recording coming soon')}>
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
