# Web App

This document describes the HerdSense web application built with Vite + React + TypeScript.

---

## Why a web app (PWA) instead of a native mobile app?

- A web app works on any phone without installing anything
- ONNX Runtime Web runs ML models in the browser just fine
- No React Native to Python bridge problem
- Single codebase for all platforms
- Can be saved to the home screen as a PWA
- Faster to build and iterate

---

## App structure

The app has 4 main screens:

1. **Home screen** - Shows demo presets and navigation
2. **Analysis screen** - Runs the pipeline and shows results
3. **Map screen** - Regional stress map with satellite comparison
4. **History screen** - Past scan results

---

## Screen details

### Home screen

What the user sees when they open the app:

- App title and logo
- Three quick-select demo preset cards:
  - Healthy Herd (pre-computed score ~22)
  - Early Stress (pre-computed score ~58)
  - Critical Distress (pre-computed score ~84)
- "Record New" button (placeholder for future camera integration)
- "View Regional Map" button
- History link

### Analysis screen

Shown when a demo preset is selected:

- The preset video plays in a hidden video element
- Processing indicator with progress
- Bounding boxes overlay on the video (Canvas)
- When complete, transitions to results view

### Results view (part of Analysis screen)

- Large score dial (0-100) with color:
  - Green (0-35): Normal
  - Amber (36-65): Moderate stress
  - Red (66-100): Critical
- Trend arrow: up (escalating), right (stable), down (improving)
- Action recommendation box
- "Share Anonymized" toggle button
- Score breakdown bars: clustering, motion, posture, audio
- "Try Another" button

### Map screen

Shows regional stress data:

- Leaflet map with markers for each herd report
- Markers colored by stress score (green to red)
- Click a marker to see details: score, animal count, time
- Toggle button for satellite NDVI overlay
- Timeline slider at the bottom to see how stress changed over days
- Legend showing score color mapping

### History screen

- List of past scans loaded from localStorage
- Each entry shows: date, score, trend
- Mini sparkline chart for the trend

---

## Navigation

```
Home Screen
    |
    +--> Analysis Screen
    |        |
    |        +--> Results View
    |               |
    |               +--> Home Screen
    |
    +--> Map Screen
    |
    +--> History Screen
```

---

## Key UI features

**Offline first:** All screens work without internet after the page loads.

**High contrast:** Dark background with bright colors. Designed for outdoor use.

**Large touch targets:** Buttons are large enough to tap easily.

**Minimal text:** Score is shown as a number and color. Recommendations use visual indicators.

**Privacy indicator:** A small indicator shows when sharing is off or on.

---

## Tech stack

| Feature | Library |
|---------|---------|
| Framework | Vite + React + TypeScript |
| ML inference | ONNX Runtime Web |
| Video processing | HTML5 Canvas API |
| Maps | Leaflet (react-leaflet) |
| Charts | Chart.js or simple SVG |
| Storage | localStorage (browser) |
| State management | React hooks + context |
| Styling | CSS modules or Tailwind |
| PWA | vite-plugin-pwa |

---

## Project files

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Root component with routing
├── components/
│   ├── HomeScreen.tsx        # Home screen with demo presets
│   ├── AnalysisView.tsx      # Analysis pipeline + results
│   ├── ScoreDial.tsx         # Score gauge component
│   ├── StressMap.tsx         # Leaflet map with markers
│   └── HistoryView.tsx       # Past scan results
├── pipeline/
│   ├── detector.ts           # ONNX YOLOv8 wrapper
│   ├── tracker.ts            # ByteTrack implementation
│   ├── features.ts           # IASI + displacement extraction
│   ├── fusion.ts             # HSSI engine
│   └── types.ts              # Type definitions
├── data/
│   ├── presets.ts            # Demo clip metadata
│   ├── mock-reports.ts       # Synthetic reports for map
│   └── mock-ndvi.ts          # Synthetic NDVI timeline
├── utils/
│   ├── clustering.ts         # Haversine distance helper
│   └── storage.ts            # localStorage wrapper
├── index.html
└── styles.css
```
