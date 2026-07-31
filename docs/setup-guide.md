# HerdSense Setup Guide

## Requirements

- Node.js 18 or later
- npm 9 or later
- A modern browser (Chrome, Safari, Firefox)

## Setup

```bash
git clone https://github.com/Amitk003/HerdSense
cd HerdSense
npm install
npm run dev
```

The app starts at http://localhost:5173.

## Building for production

```bash
npm run build
```

Output goes to the dist/ folder. You can deploy this folder to any static hosting (Vercel, Netlify, GitHub Pages).

## Running tests

```bash
npm test
```

Tests use Vitest. They test the pipeline (detection, features, fusion, tracking) and utilities (clustering, storage).

## Project structure

```
src/
  components/     - React components (HomeScreen, CameraView, AnalysisView, StressMap, NearbyFeed, etc.)
  hooks/          - Custom hooks (usePeerNetwork)
  pipeline/       - ML pipeline (detector, tracker, features, fusion, types)
  utils/          - Utilities (clustering, geohash, storage)
public/
  models/         - YOLOv8-Nano ONNX model
  wasm/           - ONNX Runtime WebAssembly runtimes
  manifest.json   - PWA manifest
  sw.js           - Service worker
```
