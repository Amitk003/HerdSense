# HerdSense

HerdSense is an offline-first, browser-based edge AI platform that detects livestock stress from standard phone video. Object detection and behavioral analysis run directly on the device, so no cloud servers, satellite feeds, or hardware collars are required.

---

## Why HerdSense

Livestock show stress days before it is visible from space. They bunch together, move erratically, and change posture. HerdSense measures these signals with a YOLOv8 model running in the browser and returns a clear 0 to 100 stress score in seconds.

---

## Best Features

### 1. On-Device AI, Zero Hardware
Point your phone camera at the herd and record 20 seconds of video. YOLOv8-Nano inference runs inside the browser with ONNX Runtime Web using WebGL, with a WebAssembly fallback for older devices. The raw video never leaves the phone.

### 2. Multi-Signal Behavioral Scoring
Three visual signals are fused into one stress score:
- **Clustering (40%)**: Inter-Animal Spatial Index, which measures how tightly the herd is bunched.
- **Motion (35%)**: Speed variance and direction change frequency. Erratic movement raises the score.
- **Posture (25%)**: Bounding box aspect ratio variance over time, which captures head droop.

The score maps to a clear recommendation: healthy, watch, or act now.

### 3. Serverless P2P Mesh Network
Reports sync directly between nearby devices over WebRTC DataChannels, grouped by geohash (roughly 150km across). No backend, no database, no per-user accounts. When a scan finishes, the report is validated and auto-shared with peers in the same region, and cluster alerts fire when 3 or more high-stress herds appear within 15km.

### 4. Offline-Ready PWA
Installable as a Progressive Web App. The service worker pre-caches the app shell, the ONNX model, and the WASM runtimes on first load, so scanning and history work with no connection. Local scan history persists in the browser.

### 5. Accessible and Mobile-First UI
Full keyboard navigation for cards and buttons, high-contrast light theme, live camera preview, upload fallback for devices without a camera, and a collapsible nearby feed with distance and recency.

---

## System Overview

```
Mobile camera / video file
            |
            v
[ 640x640 canvas preprocessor ]
            |
            v
[ YOLOv8-Nano via ONNX Runtime Web ]
            |
            v
[ Class-aware NMS + IoU tracker ]
            |
            v
[ Feature extraction: clustering, motion, posture ]
            |
            v
[ Fusion engine -> 0-100 stress score ]
            |
            +------------------------+
            |                        |
            v                        v
[ Local scan history ]    [ WebRTC P2P mesh (geohash rooms) ]
```

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Machine Learning**: ONNX Runtime Web (WASM + WebGL)
- **Computer Vision**: YOLOv8-Nano (COCO pretrained)
- **Mesh Network**: WebRTC DataChannels via PeerJS
- **GIS & Mapping**: Leaflet
- **Testing**: Vitest

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Run Locally

```bash
git clone https://github.com/Amitk003/HerdSense.git
cd HerdSense
npm install
npm run dev
```

The app starts at http://localhost:5173. Use a phone for the best camera experience, or open it on desktop and use the upload option.

### Test and Build

```bash
npm test        # run the Vitest suite
npm run build   # production build to dist/
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages).

---

## Project Structure

```
src/
  components/     React screens and UI (CameraView, AnalysisView, StressMap, NearbyFeed, ...)
  hooks/          usePeerNetwork: WebRTC mesh connection state
  pipeline/       detector, tracker, features, fusion, shared types
  utils/          clustering, geohash, localStorage history
public/
  models/         YOLOv8-Nano ONNX model
  wasm/           ONNX Runtime Web runtimes
  sw.js           PWA service worker
docs/             Architecture, protocol, pipeline, and user documentation
```

---

## Upcoming Improvements

- **Audio distress detection**: the fusion engine already accepts an audio signal. Next step is capturing and classifying distress calls during the scan.
- **Resilient mesh**: auto re-election of the room hub when the current hub disconnects, and automatic report expiry so stale markers clear from the map.
- **Fine-tuned livestock model**: the current model is COCO pretrained, which only covers cattle, sheep, and horses. A herd-specific model would add goats, camels, and donkeys with better accuracy.
- **Faster analysis**: move from post-capture sampling toward near-real-time streaming inference with live detection overlay on the camera preview.
- **Offline map tiles**: bundle or cache regional map tiles so the map is fully usable without a connection.
- **Local language support**: interface and recommendations in the languages of the pastoralist communities that use it.

---

## Documentation

- [Architecture](docs/architecture.md)
- [Edge pipeline](docs/edge-pipeline.md)
- [P2P protocol reference](docs/api-reference.md)
- [Data flow](docs/data-flow.md)
- [Technical decisions](docs/technical-decisions.md)
- [User guide](docs/user-guide.md)
- [Setup guide](docs/setup-guide.md)

---

## Privacy

Raw video is processed entirely on the device and never uploaded. Shared network reports contain only the stress score, species, animal count, and location. The app has no accounts, no backend, and no user database. Peer discovery uses the free PeerJS cloud broker for signaling only.
