import { useState, useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'
import type { StressReport } from '../pipeline/types'
import { geoHashBounds } from '../utils/geohash'

const PEER_HOST = '0.peerjs.com'
const PEER_PORT = 443
const PEER_PATH = '/'
const MAX_CACHED_REPORTS = 50

export interface PeerState {
  status: 'connecting' | 'connected' | 'error'
  errorMsg: string
  reports: StressReport[]
  peerCount: number
  geohash: string | null
  location: { lat: number; lng: number } | null
  broadcast: (report: StressReport) => void
}

function usesSameRoom(gh1: string, gh2: string): boolean {
  if (gh1 === gh2) return true
  const b1 = geoHashBounds(gh1)
  const b2 = geoHashBounds(gh2)
  const latOverlap = b1.lat[0] < b2.lat[1] && b2.lat[0] < b1.lat[1]
  const lngOverlap = b1.lng[0] < b2.lng[1] && b2.lng[0] < b1.lng[1]
  return latOverlap && lngOverlap
}

function getInitialLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 300000 }
    )
  })
}

export function usePeerNetwork(geoHashOverride?: string): PeerState {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [errorMsg, setErrorMsg] = useState('')
  const [reports, setReports] = useState<StressReport[]>([])
  const [peerCount, setPeerCount] = useState(0)
  const [geohash, setGeohash] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const peerRef = useRef<Peer | null>(null)
  const hubConnRef = useRef<any>(null)
  const reportsRef = useRef<StressReport[]>([])
  const isDestroyedRef = useRef(false)

  // Keep reportsRef in sync
  useEffect(() => {
    reportsRef.current = reports
  }, [reports])

  const addReport = useCallback((report: StressReport) => {
    setReports(prev => {
      const ids = new Set(prev.map(r => r.id))
      if (ids.has(report.id)) return prev
      const next = [report, ...prev]
      return next.slice(0, MAX_CACHED_REPORTS)
    })
  }, [])

  useEffect(() => {
    isDestroyedRef.current = false

    async function init() {
      let gh = geoHashOverride || null
      if (!gh) {
        const loc = await getInitialLocation()
        if (loc) {
          const { encodeGeoHash } = await import('../utils/geohash')
          gh = encodeGeoHash(loc.lat, loc.lng, 3)
          setGeohash(gh)
          setLocation(loc)
        } else {
          setStatus('error')
          setErrorMsg('Location access needed to find nearby users.')
          return
        }
      } else {
        setGeohash(gh)
      }

      const roomId = `hs-${gh}`

      // Try to become the room hub
      try {
        const hubPeer = new Peer(roomId, {
          host: PEER_HOST,
          port: PEER_PORT,
          path: PEER_PATH
        })

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('timeout')), 5000)
          hubPeer.on('open', () => {
            clearTimeout(timeout)
            peerRef.current = hubPeer
            setStatus('connected')
            resolve()
          })
          hubPeer.on('error', (err) => {
            clearTimeout(timeout)
            reject(err)
          })
        })

        // We are the hub
        hubPeer.on('connection', (conn) => {
          hubConnRef.current = conn
          setPeerCount(1)

          conn.on('data', (data: any) => {
            if (data.type === 'herd_report') {
              addReport(data.payload as StressReport)
            }
            if (data.type === 'sync_request') {
              conn.send({
                type: 'sync_response',
                payload: reportsRef.current.slice(0, 20)
              })
            }
            if (data.type === 'sync_response') {
              const synced = data.payload as StressReport[]
              for (const r of synced) addReport(r)
            }
          })

          conn.on('close', () => {
            setPeerCount(0)
          })
        })

        hubPeer.on('disconnected', () => {
          setStatus('connecting')
        })

      } catch {
        // Room exists, connect as member
        try {
          const memberPeer = new Peer({
            host: PEER_HOST,
            port: PEER_PORT,
            path: PEER_PATH
          })

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('timeout')), 5000)
            memberPeer.on('open', () => {
              clearTimeout(timeout)
              peerRef.current = memberPeer
              resolve()
            })
            memberPeer.on('error', (err) => {
              clearTimeout(timeout)
              reject(err)
            })
          })

          const conn = memberPeer.connect(roomId, { reliable: true })

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('timeout')), 5000)
            conn.on('open', () => {
              clearTimeout(timeout)
              hubConnRef.current = conn
              peerRef.current = memberPeer
              setStatus('connected')
              setPeerCount(1)
              resolve()
            })
            conn.on('error', (err) => {
              clearTimeout(timeout)
              reject(err)
            })
          })

          // Request sync
          conn.send({ type: 'sync_request' })

          conn.on('data', (data: any) => {
            if (data.type === 'herd_report') {
              addReport(data.payload as StressReport)
            }
            if (data.type === 'sync_response') {
              const synced = data.payload as StressReport[]
              for (const r of synced) addReport(r)
            }
          })

          conn.on('close', () => {
            setStatus('connecting')
            setPeerCount(0)
          })

        } catch {
          setStatus('error')
          setErrorMsg('Could not connect to nearby network.')
        }
      }
    }

    init()

    return () => {
      isDestroyedRef.current = true
      if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
      }
    }
  }, [geoHashOverride])

  const broadcast = useCallback((report: StressReport) => {
    addReport(report)
    if (hubConnRef.current && hubConnRef.current.open) {
      hubConnRef.current.send({
        type: 'herd_report',
        payload: report
      })
    }
  }, [addReport])

  return { status, errorMsg, reports, peerCount, geohash, location, broadcast }
}

