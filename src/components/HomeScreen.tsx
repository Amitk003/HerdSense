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
  const [toast, setToast] = useState('')
  const history = loadHistory()
  const last = history.length > 0 ? history[0] : null

  const handlePreset = async (preset: DemoPreset) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

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
      {toast && <div className="toast">{toast}</div>}

      <div className="home-brand">
        <h1>HerdSense</h1>
        <p>Livestock stress detection</p>
      </div>

      <button className="record-btn" onClick={() => setToast('Camera coming soon')}>
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
        <button className="last-resume" onClick={onNavigateHistory}>
          Last: {last.score} on {new Date(last.timestamp).toLocaleDateString()}
        </button>
      )}

      <div className="home-footer">
        <button className={"footer-btn" + (false ? '' : '')} onClick={onNavigateMap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <span>Map</span>
        </button>
        <button className="footer-btn" onClick={onNavigateHistory}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>History</span>
        </button>
      </div>
    </div>
  )
}
