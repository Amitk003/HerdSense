# HerdSense Web App

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| / | HomeScreen | Landing with demo presets and main actions |
| /analysis | AnalysisView | Shows stress score, trend, recommendation |
| /map | StressMap | Regional map with nearby reports |
| /history | HistoryView | Past scans |

## Components

### HomeScreen
- Three demo preset cards (Green/Yellow/Red)
- "Record New" button opens CameraView
- "View History" button
- Peer connection badge (shows when connected to network)

### CameraView
- Live camera preview using getUserMedia
- "Start Recording" button
- 20-second countdown timer
- File upload button for desktop
- On recording complete: runs pipeline automatically

### AnalysisView
- Large score display with color
- Four sub-metric bars (clustering, motion, posture, audio)
- Trend indicator (up/down/stable)
- Recommendation text
- Share button broadcasts via WebRTC
- "View Regional Map" button

### StressMap
- Leaflet map with OpenStreetMap tiles
- Circled markers colored by stress level
- Marker shows score on hover
- Alert zones (red circles) when 3+ high-stress reports cluster
- Aligns to focused report on tap from NearbyFeed

### NearbyFeed
- Collapsible bottom panel
- List of incoming peer reports sorted by time
- Each item shows distance (km), time ago, score badge, animal count
- Filter: All / High stress only
- Tap to fly map to report location

### HistoryView
- List of past scans from localStorage
- Score trend graph
- Date and time stamps

## Responsive design

The app is designed for mobile-first but works on desktop. The map and camera view adapt to screen size. Touch interactions work on all components.

## PWA

- Installable on Android and iOS
- Service worker for offline caching
- Works offline once loaded
- Smooth animations and transitions
