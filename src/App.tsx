import { useState, useCallback, useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import HomeScreen from './components/HomeScreen'
import CameraView from './components/CameraView'
import AnalysisView from './components/AnalysisView'
import StressMap from './components/StressMap'
import HistoryView from './components/HistoryView'
import NearbyFeed from './components/NearbyFeed'
import { usePeerNetwork } from './hooks/usePeerNetwork'
import type { HerdStressResult, StressReport, AlertCluster } from './pipeline/types'

type Screen = 'home' | 'camera' | 'analysis' | 'map' | 'history'

let reportCounter = 0

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [result, setResult] = useState<HerdStressResult | null>(null)
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const peer = usePeerNetwork()

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }, [])

  const handleAnalysisComplete = useCallback((r: HerdStressResult) => {
    setResult(r)
    setScreen('analysis')
  }, [])

  const handleBackHome = useCallback(() => {
    setResult(null)
    setScreen('home')
  }, [])

  const handleShare = useCallback(() => {
    if (!result || !peer.location) return
    reportCounter++
    const report: StressReport = {
      id: `r-${Date.now()}-${reportCounter}`,
      lat: peer.location.lat,
      lng: peer.location.lng,
      score: result.score,
      animalCount: result.animalCount,
      species: result.species,
      timestamp: result.timestamp
    }
    peer.broadcast(report)
    showToast('Report shared with nearby users')
  }, [result, peer.location, peer.broadcast, showToast])

  const handleClusterAlert = useCallback((cluster: AlertCluster) => {
    showToast(
      `Alert: ${cluster.herdCount} herds with avg score ${cluster.avgScore} within 15km`
    )
  }, [showToast])

  const handleFeedSelect = useCallback((report: StressReport) => {
    setFocusedReportId(report.id)
  }, [])

  return (
    <ErrorBoundary>
    <div className="app">
      {!isOnline ? <div className="peer-badge offline">Offline</div>
        : peer.status === 'error' ? <div className="peer-badge error">{peer.errorMsg}</div>
        : peer.status === 'connecting' ? <div className="peer-badge connecting">Connecting...</div>
        : peer.status === 'connected' && peer.peerCount === 0 ? <div className="peer-badge connected">No nearby users</div>
        : peer.status === 'connected' && peer.peerCount > 0 ? <div className="peer-badge connected">{peer.peerCount} nearby</div>
        : null}

      {toast && <div className="toast">{toast}</div>}

      {screen === 'home' && (
        <HomeScreen
          onPresetSelected={handleAnalysisComplete}
          onNavigateCamera={() => setScreen('camera')}
          onNavigateMap={() => setScreen('map')}
          onNavigateHistory={() => setScreen('history')}
        />
      )}
      {screen === 'camera' && (
        <CameraView
          onComplete={handleAnalysisComplete}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'analysis' && result && (
        <AnalysisView
          result={result}
          onBack={handleBackHome}
          onShare={handleShare}
          onViewHistory={() => setScreen('history')}
          onViewMap={() => setScreen('map')}
        />
      )}
      {screen === 'map' && (
        <>
          <StressMap
            onBack={handleBackHome}
            reports={peer.reports}
            focusedReportId={focusedReportId}
            onClusterAlert={handleClusterAlert}
          />
          <NearbyFeed
            reports={peer.reports}
            location={peer.location}
            onSelect={handleFeedSelect}
          />
        </>
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
