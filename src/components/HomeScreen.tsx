import { useState } from 'react'
import { DEMO_PRESETS } from '../data/presets'
import { calcHssi } from '../pipeline/fusion'
import { saveRecord, loadHistory } from '../utils/storage'
import type { HerdStressResult, DemoPreset, FrameFeatures } from '../pipeline/types'

interface HomeScreenProps {
  onPresetSelected: (result: HerdStressResult) => void
  onNavigateMap: () => void
  onNavigateHistory: () => void
}

function dotColor(score: number): string {
  if (score < 35) return '#84cc16'
  if (score < 65) return '#d97706'
  return '#b91c1c'
}

function scoreColor(score: number): string {
  if (score < 35) return '#84cc16'
  if (score < 65) return '#d97706'
  return '#b91c1c'
}

export default function HomeScreen({ onPresetSelected, onNavigateMap, onNavigateHistory }: HomeScreenProps) {
  const [loading, setLoading] = useState(false)
  const history = loadHistory()
  const last = history.length > 0 ? history[0] : null

  const handlePreset = async (preset: DemoPreset) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))

    const h = loadHistory()
    const result = calcHssi(
      [] as FrameFeatures[],
      preset.precomputedSubscores.audio,
      h
    )

    const final: HerdStressResult = {
      ...result,
      score: preset.precomputedScore,
      clustering: preset.precomputedSubscores.clustering,
      motion: preset.precomputedSubscores.motion,
      posture: preset.precomputedSubscores.posture,
      audio: preset.precomputedSubscores.audio,
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
          <div className="spinner" />
          <p>Analyzing herd...</p>
        </div>
      )}

      <div className="home-brand">
        <h1>HerdSense</h1>
        <p>Livestock stress detection</p>
      </div>

      <button className="record-btn" onClick={() => alert('Camera coming soon')}>
        Record New
      </button>

      <div className="scenarios-label">Demo scenarios</div>

      <div className="scenario-list">
        {DEMO_PRESETS.map(p => (
          <button key={p.id} className="scenario-item" onClick={() => handlePreset(p)}>
            <span className="scenario-dot" style={{ background: dotColor(p.precomputedScore) }} />
            <div className="scenario-info">
              <span className="scenario-name">{p.label}</span>
              <span className="scenario-desc">{p.description}</span>
            </div>
            <span className="scenario-score" style={{ color: scoreColor(p.precomputedScore) }}>
              {p.precomputedScore}
            </span>
          </button>
        ))}
      </div>

      {last && (
        <div className="last-resume" onClick={onNavigateHistory}>
          Last: {last.score} on {new Date(last.timestamp).toLocaleDateString()}
        </div>
      )}

      <div className="home-footer">
        <button className="footer-btn" onClick={onNavigateMap}>
          <span>&#x1F5FA;</span>
          <span>Map</span>
        </button>
        <button className="footer-btn" onClick={onNavigateHistory}>
          <span>&#x1F4CB;</span>
          <span>History</span>
        </button>
      </div>
    </div>
  )
}
