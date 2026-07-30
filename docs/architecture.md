# HerdSense Architecture

HerdSense has no backend server. Everything runs in the browser.

## Layers

### 1. Web App (Vite + React + TypeScript)

The user interface. Runs as a PWA on any modern browser. Works on phones and desktops. Has four screens: Home, Analysis, Map, History.

### 2. ML Pipeline (ONNX Runtime Web)

All machine learning runs in the browser. YOLOv8-Nano detects animals in video frames. ByteTrack tracks them across frames. FeatureExtractor measures clustering, motion, and posture. Fusion engine combines these into a stress score.

### 3. P2P Network (PeerJS via WebRTC)

No server stores any data. Devices connect directly to each other using WebRTC DataChannels. A free cloud broker (PeerJS) helps devices find each other. After that, data flows directly between browsers.

### 4. Map (Leaflet)

Shows stress reports from nearby users on an OpenStreetMap background. Clusters reports into alert zones when 3+ high-stress reports appear within 15km.

---

## Data flow

```
Camera/video -> Detector.detectFrames() -> FeatureExtractor.extract()
  -> calcHssi() -> score displayed in AnalysisView
  -> optional Share -> usePeerNetwork.broadcast()
  -> WebRTC DataChannel -> nearby peers receive report
  -> StressMap re-renders with new marker
  -> findAlertClusters() checks for alert zones
```

## Key principles

- No user accounts or authentication
- No data stored on any server
- Everything runs on the device
- Sharing is always opt-in
- Location data is coarse (156km geohash)
