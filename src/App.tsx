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

type Screen = 'home' | 'camera' | 'upload' | 'analysis' | 'map' | 'history'

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

    const loc = peer.location || { lat: 1.35, lng: 36.82 }
    reportCounter++
    const report: StressReport = {
      id: `r-${Date.now()}-${reportCounter}`,
      lat: loc.lat,
      lng: loc.lng,
      score: r.score,
      animalCount: r.animalCount,
      species: r.species,
      timestamp: r.timestamp
    }
    peer.broadcast(report)
    showToast('Scan result automatically shared with nearby users')
  }, [peer.location, peer.broadcast, showToast])

  const handleBackHome = useCallback(() => {
    setResult(null)
    setScreen('home')
  }, [])

  const handleClusterAlert = useCallback((cluster: AlertCluster) => {
    showToast(
      `Alert: ${cluster.herdCount} herds with avg score ${cluster.avgScore} within 15km`
    )
  }, [showToast])

  const handleFeedSelect = useCallback((report: StressReport) => {
    setFocusedReportId(report.id)
  }, [])

  const navTo = useCallback((s: Screen) => {
    setResult(null)
    setScreen(s)
  }, [])

  function statusLabel() {
    if (!isOnline) return { dot: 'offline', label: 'Offline' }
    if (peer.status === 'error') return { dot: 'error', label: peer.errorMsg }
    if (peer.status === 'connecting') return { dot: 'connecting', label: 'Connecting...' }
    if (peer.status === 'connected' && peer.peerCount === 0) return { dot: 'online', label: 'No nearby users' }
    if (peer.status === 'connected' && peer.peerCount > 0) return { dot: 'online', label: `${peer.peerCount} nearby` }
    return { dot: 'offline', label: 'Offline' }
  }

  const st = statusLabel()

  return (
    <ErrorBoundary>
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-header-brand">HerdSense</span>
          <span className="app-header-status">
            <span className={`status-dot ${st.dot}`} />
            {st.label}
          </span>
        </div>
        <div className="app-header-actions">
          {screen !== 'home' && (
            <button className="header-nav-btn" onClick={() => navTo('home')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </button>
          )}
          <button
            className={`header-nav-btn${screen === 'map' ? ' active' : ''}`}
            onClick={() => setScreen('map')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Map
          </button>
        </div>
      </header>

      {toast && <div className="toast">{toast}</div>}

      {screen === 'home' && (
        <HomeScreen
          onNavigateCamera={() => setScreen('camera')}
          onNavigateUpload={() => setScreen('upload')}
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
      {screen === 'upload' && (
        <CameraView
          onComplete={handleAnalysisComplete}
          onBack={() => setScreen('home')}
          startInUpload
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
        <>
          <StressMap
            onBack={handleBackHome}
            reports={peer.reports}
            location={peer.location}
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