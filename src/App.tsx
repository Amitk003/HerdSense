import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import HomeScreen from './components/HomeScreen'
import AnalysisView from './components/AnalysisView'
import StressMap from './components/StressMap'
import HistoryView from './components/HistoryView'
import type { HerdStressResult } from './pipeline/types'

type Screen = 'home' | 'analysis' | 'map' | 'history'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [result, setResult] = useState<HerdStressResult | null>(null)

  const handleAnalysisComplete = (r: HerdStressResult) => {
    setResult(r)
    setScreen('analysis')
  }

  const handleBackHome = () => {
    setResult(null)
    setScreen('home')
  }

  return (
    <ErrorBoundary>
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          onPresetSelected={handleAnalysisComplete}
          onNavigateMap={() => setScreen('map')}
          onNavigateHistory={() => setScreen('history')}
        />
      )}
      {screen === 'analysis' && result && (
        <AnalysisView
          result={result}
          onBack={handleBackHome}
          onViewHistory={() => setScreen('history')}
          onViewMap={() => setScreen('map')}
        />
      )}
      {screen === 'map' && (
        <StressMap onBack={handleBackHome} reports={[]} />
      )}
      {screen === 'history' && (
        <HistoryView
          onBack={handleBackHome}
          onRunNew={() => setScreen('home')}
        />
      )}
    </div>
    </ErrorBoundary>
  )
}
