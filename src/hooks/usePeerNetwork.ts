import { useState, useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'
import type { StressReport } from '../pipeline/types'
import { MAX_CACHED_REPORTS } from '../constants'

const PEER_HOST = '0.peerjs.com'
const PEER_PORT = 443
const PEER_PATH = '/'
const DEFAULT_LOCATION = { lat: 1.35, lng: 36.82 }

export interface PeerState {
  status: 'connecting' | 'connected' | 'error'
  errorMsg: string
  reports: StressReport[]
  peerCount: number
  geohash: string | null
  location: { lat: number; lng: number } | null
  broadcast: (report: StressReport) => void
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
      { timeout: 10000, maximumAge: 300000 }
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
  const hubConnsRef = useRef<Map<string, any>>(new Map())
  const reportsRef = useRef<StressReport[]>([])
  const isDestroyedRef = useRef(false)

  // Keep reportsRef in sync
  useEffect(() => {
    reportsRef.current = reports
  }, [reports])

  // Watch GPS location updates seamlessly in background
  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc)
      },
      err => console.warn('Geolocation watch notice:', err.message),
      { timeout: 15000, maximumAge: 60000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

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
        const activeLoc = loc || DEFAULT_LOCATION
        const { encodeGeoHash } = await import('../utils/geohash')
        gh = encodeGeoHash(activeLoc.lat, activeLoc.lng, 3)
        setGeohash(gh)
        if (loc) setLocation(loc)
      } else {
        setGeohash(gh)
      }

      const roomId = gh

      const syncHubPeerCount = () => {
        for (const [peerId, conn] of hubConnsRef.current.entries()) {
          if (!conn || !conn.open) {
            hubConnsRef.current.delete(peerId)
          }
        }
        const activeMembers = hubConnsRef.current.size
        setPeerCount(activeMembers)

        const totalInRoom = activeMembers + 1
        for (const conn of hubConnsRef.current.values()) {
          if (conn && conn.open) {
            conn.send({ type: 'peer_count', payload: totalInRoom })
          }
        }
      }

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
          conn.on('open', () => {
            hubConnsRef.current.set(conn.peer, conn)
            syncHubPeerCount()
          })

          conn.on('data', (data: any) => {
            if (data.type === 'herd_report') {
              const rep = data.payload as StressReport
              addReport(rep)
              for (const [peerId, otherConn] of hubConnsRef.current.entries()) {
                if (peerId !== conn.peer && otherConn && otherConn.open) {
                  otherConn.send({ type: 'herd_report', payload: rep })
                }
              }
            }
            if (data.type === 'sync_request') {
              conn.send({
                type: 'sync_response',
                payload: reportsRef.current.slice(0, 20)
              })
              syncHubPeerCount()
            }
            if (data.type === 'sync_response') {
              const synced = data.payload as StressReport[]
              for (const r of synced) addReport(r)
            }
          })

          conn.on('close', () => {
            hubConnsRef.current.delete(conn.peer)
            syncHubPeerCount()
          })

          conn.on('error', () => {
            hubConnsRef.current.delete(conn.peer)
            syncHubPeerCount()
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
              hubConnsRef.current.set(roomId, conn)
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
            if (data.type === 'peer_count') {
              const totalInRoom = Number(data.payload) || 1
              setPeerCount(Math.max(0, totalInRoom - 1))
            }
            if (data.type === 'herd_report') {
              addReport(data.payload as StressReport)
            }
            if (data.type === 'sync_response') {
              const synced = data.payload as StressReport[]
              for (const r of synced) addReport(r)
            }
          })

          conn.on('close', () => {
            hubConnsRef.current.delete(roomId)
            setStatus('connecting')
            setPeerCount(0)
          })

          conn.on('error', () => {
            hubConnsRef.current.delete(roomId)
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

    const heartbeat = setInterval(() => {
      if (peerRef.current && hubConnsRef.current.size > 0) {
        for (const [peerId, conn] of hubConnsRef.current.entries()) {
          if (!conn || !conn.open) {
            hubConnsRef.current.delete(peerId)
          }
        }
        setPeerCount(hubConnsRef.current.size)
      }
    }, 5000)

    return () => {
      isDestroyedRef.current = true
      clearInterval(heartbeat)
      hubConnsRef.current.clear()
      if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
      }
    }
  }, [geoHashOverride])

  const broadcast = useCallback((report: StressReport) => {
    addReport(report)
    for (const conn of hubConnsRef.current.values()) {
      if (conn && conn.open) {
        conn.send({
          type: 'herd_report',
          payload: report
        })
      }
    }
  }, [addReport])

  return { status, errorMsg, reports, peerCount, geohash, location, broadcast }
}
