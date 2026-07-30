import { useState, useRef, useEffect, useCallback } from 'react'
import { Detector } from '../pipeline/detector'
import { FeatureExtractor } from '../pipeline/features'
import { calcHssi } from '../pipeline/fusion'
import { saveRecord, loadHistory } from '../utils/storage'
import type { HerdStressResult } from '../pipeline/types'

const RECORD_DURATION = 20
const FPS = 30

interface CameraViewProps {
  onComplete: (result: HerdStressResult) => void
  onBack: () => void
}

export default function CameraView({ onComplete, onBack }: CameraViewProps) {
  const [status, setStatus] = useState<'preparing' | 'ready' | 'recording' | 'processing' | 'error'>('preparing')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(RECORD_DURATION)
  const [useFileUpload, setUseFileUpload] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStatus('ready')
    } catch (err) {
      console.warn('Camera not available, showing file upload fallback:', err)
      setUseFileUpload(true)
      setStatus('ready')
    }
  }

  function stopCamera() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const startRecording = useCallback(() => {
    if (!streamRef.current) return
    chunksRef.current = []
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' })
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      processRecording()
    }

    recorder.start(100)
    setStatus('recording')

    let remaining = RECORD_DURATION
    setCountdown(remaining)
    timerRef.current = setInterval(() => {
      remaining--
      setCountdown(remaining)
      if (remaining <= 0) {
        stopRecording()
      }
    }, 1000)
  }, [])

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }

  async function processRecording() {
    stopCamera()
    setStatus('processing')

    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)

    const video = document.createElement('video')
    video.src = url
    video.muted = true

    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error('Failed to load recorded video'))
        video.load()
      })

      const duration = video.duration
      const totalFrames = Math.floor(duration * FPS)

      const detector = new Detector()
      await detector.loadModel('/models/yolov8n.onnx')

      const frames = await detector.detectFrames(video, totalFrames)

      if (frames.length === 0) {
        setError('No animals detected in the video. Try recording again.')
        setStatus('error')
        URL.revokeObjectURL(url)
        return
      }

      const extractor = new FeatureExtractor()
      const features = extractor.extract(video, frames, totalFrames)

      const history = loadHistory()
      const result = calcHssi(features, 0, history)

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
        animalCount: frames.reduce((max, f) => Math.max(max, f.boxes.length), 0)
      })

      URL.revokeObjectURL(url)
      onComplete(final)
    } catch (err) {
      console.error('Processing failed:', err)
      setError('Processing failed. Try recording again with better lighting.')
      setStatus('error')
      URL.revokeObjectURL(url)
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('processing')
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.muted = true

    video.onloadedmetadata = async () => {
      const duration = video.duration
      const totalFrames = Math.floor(duration * FPS)

      try {
        const detector = new Detector()
        await detector.loadModel('/models/yolov8n.onnx')

        const frames = await detector.detectFrames(video, totalFrames)

        if (frames.length === 0) {
          setError('No animals detected in the video.')
          setStatus('error')
          URL.revokeObjectURL(url)
          return
        }

        const extractor = new FeatureExtractor()
        const features = extractor.extract(video, frames, totalFrames)

        const history = loadHistory()
        const result = calcHssi(features, 0, history)

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
          animalCount: frames.reduce((max, f) => Math.max(max, f.boxes.length), 0)
        })

        URL.revokeObjectURL(url)
        onComplete(final)
      } catch (err) {
        console.error('Processing failed:', err)
        setError('Processing failed. Try a different video file.')
        setStatus('error')
        URL.revokeObjectURL(url)
      }
    }
  }

  function handleRetry() {
    setError('')
    setStatus('preparing')
    chunksRef.current = []
    startCamera()
  }

  return (
    <div className="screen camera-screen">
      <div className="camera-header">
        <button className="back-link" onClick={onBack}>&#8592; Back</button>
        <h1>{useFileUpload ? 'Upload Video' : 'Record Herd'}</h1>
      </div>

      {useFileUpload ? (
        <div className="camera-body">
          <div className="upload-area">
            <p>Camera not available on this device.</p>
            <p style={{ color: '#a8a29e', fontSize: 13, marginTop: 8 }}>
              Upload a video file of your herd instead.
            </p>
            <label className="upload-btn">
              Choose Video File
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="camera-body">
          <div className="camera-preview-wrap">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
            {status === 'preparing' && (
              <div className="camera-overlay">
                <div className="loading-spinner" />
                <p>Starting camera...</p>
              </div>
            )}
            {status === 'recording' && (
              <div className="camera-overlay">
                <div className="recording-indicator">
                  <span className="recording-dot" />
                  Recording... {countdown}s
                </div>
              </div>
            )}
          </div>

          <div className="camera-actions">
            {status === 'ready' && (
              <button className="record-btn" onClick={startRecording}>
                Start Recording (20s)
              </button>
            )}
            {status === 'recording' && (
              <button className="record-btn stop-btn" onClick={stopRecording}>
                Stop Now
              </button>
            )}
            {status === 'processing' && (
              <div className="processing-indicator">
                <div className="loading-spinner" />
                <p>Analyzing video...</p>
              </div>
            )}
            {status === 'error' && (
              <div className="error-card">
                <p>{error}</p>
                <button className="nav-btn" onClick={handleRetry}>Try Again</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}