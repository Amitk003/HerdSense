# HerdSense: On-Device Livestock Intelligence Platform

HerdSense is an offline-first, browser-based edge AI system that detects livestock stress signals in real time using standard mobile video streams. By processing computer vision and behavioral analysis directly on the user's device, HerdSense provides actionable herd welfare insights without requiring cloud servers, satellite delays, or hardware collars.

---

## Key Capabilities

### 1. Zero Hardware Edge Intelligence
Point any smartphone camera at your herd to capture 20 seconds of video. HerdSense executes lightweight YOLOv8 neural network inference directly inside the browser engine using ONNX Runtime Web.

### 2. Multi Modal Behavioral Analysis
Evaluates herd stress across physical signals:
* **Inter Animal Spatial Index (IASI)**: Measures spatial dispersion and panic clustering.
* **Gait Motion Score**: Quantifies speed variance and movement direction shifts.
* **Posture Dynamics**: Detects head droop and body aspect ratio changes.

### 3. Serverless P2P Mesh Network
HerdSense connects nearby pastoralists via WebRTC peer to peer data channels over localized 100km geohashes. Regional stress reports sync automatically without any centralized database or server infrastructure.

### 4. 100% Privacy & Data Sovereignty
Raw video feeds never leave the local browser window. Analysis executes in device memory, and shared network reports contain only anonymized location coordinates and numeric scores.

---

## System Architecture Overview

```
Mobile Camera / Video Input
            |
            v
[ 640x640 Canvas Pre-processor ]
            |
            v
[ YOLOv8 Neural Network - ONNX Web ]
            |
            v
[ IoU Object Tracker & NMS Deduplication ]
            |
            v
[ Multi Signal Behavioral Fusion Engine ]
            |
            +------------------------+
            |                        |
            v                        v
[ Local Indexed History ]   [ WebRTC P2P Mesh Network ]
```

---

## Technical Stack

* **Frontend Engine**: React 18, Vite, TypeScript
* **Machine Learning**: ONNX Runtime Web (WASM & WebGL execution providers)
* **Computer Vision**: YOLOv8 Nano object detection model
* **Mesh Network**: WebRTC DataChannels (PeerJS)
* **GIS & Mapping**: Leaflet
* **Testing Suite**: Vitest

---

## Quick Start Guide

### Prerequisites
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/Amitk003/HerdSense.git
cd HerdSense

# Install dependencies
npm install

# Start local development server
npm run dev

# Run automated unit test suite
npm test

# Build production bundle
npm run build
```

---

## Production Deployment & Offline Readiness

HerdSense is configured as a Progressive Web Application (PWA). Its service worker pre-caches all static assets, WebAssembly runtimes, and ONNX neural network model binaries upon first load, delivering complete functionality offline in remote environments.
