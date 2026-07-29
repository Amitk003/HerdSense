# Mobile App

This document describes the HerdSense mobile application built with React Native (Expo).

---

## App structure

The app has 4 main screens:

1. **Home screen** - Shows demo presets and quick actions
2. **Capture screen** - Camera viewfinder with recording controls
3. **Results screen** - Shows the stress score and recommendations
4. **Map screen** - Regional stress map (requires shared data)

---

## Screen details

### Home screen

What the user sees when they open the app:

- App title and logo
- Three quick-select demo clips:
  - Healthy Herd (pre-computed score ~22)
  - Early Stress (pre-computed score ~58)
  - Critical Distress (pre-computed score ~84)
- "Record New" button
- "View Regional Map" button (navigation to map screen)
- Settings icon (for configuring privacy options)

### Capture screen

Shown when the user taps "Record New":

- Live camera preview with semi-transparent overlay
- Bounding boxes drawn around detected animals (if running detection)
- 20-second countdown timer as a progress ring
- Live indicators: Audio level, motion level, animal count
- Cancel button to go back
- Recording starts automatically when the screen opens

### Results screen

Shown after analysis is complete:

- Large score dial (0-100) with color:
  - Green (0-35): Normal
  - Amber (36-65): Moderate stress
  - Red (66-100): Critical
- Trend arrow: up (escalating), right (stable), down (improving)
- Action recommendation box (uses icons primarily, minimal text)
- "Share Anonymized" toggle button
- Score breakdown bars: clustering, motion, posture, audio
- "Record Another" button
- "View History" button (shows past scans)

### Map screen

Shows regional stress data:

- Leaflet map with H3 hex grid overlay
- Hexagons colored by average stress score (green to red)
- Click a hex to see details: number of reports, average score
- Toggle button for satellite NDVI overlay
- Timeline slider at the bottom to see how stress changed over days
- Legend showing score color mapping

---

## Navigation

```
Home Screen
    |
    +--> Capture Screen
    |        |
    |        +--> Results Screen
    |               |
    |               +--> Home Screen (loop)
    |               +--> History View
    |
    +--> Map Screen
    |
    +--> Settings
```

---

## Key UI features

**Offline first:** All screens work without internet. The map screen shows cached data if no connection.

**High contrast:** Dark background with bright colors. Designed for outdoor use in bright sunlight.

**Large touch targets:** Buttons are at least 48x48dp. Easy to tap with rough hands.

**Minimal text:** Score is shown as a number and color. Recommendations use icons.

**Privacy indicator:** A small lock icon on the top bar shows when sharing is off. It changes to an unlocked icon when sharing is on.

---

## Tech stack

| Feature | Library |
|---------|---------|
| Framework | React Native (Expo) |
| Camera | expo-camera |
| Audio | expo-av |
| Maps | react-native-maps + Leaflet WebView |
| Navigation | @react-navigation/native |
| Charts | react-native-svg + victory-native |
| Storage | expo-sqlite |
| State management | React Context + useReducer |
| Gestures | react-native-gesture-handler |

---

## Project files

```
mobile/
├── app/                     # Expo Router pages
│   ├── index.tsx            # Home screen
│   ├── capture.tsx          # Capture screen
│   ├── results.tsx          # Results screen
│   └── map.tsx              # Map screen
├── components/              # Reusable UI components
│   ├── ScoreDial.tsx
│   ├── ProgressRing.tsx
│   ├── ActionBox.tsx
│   └── HexMap.tsx
├── services/                # Business logic
│   ├── pipeline.ts          # Calls edge pipeline
│   ├── storage.ts           # Local database
│   └── sharing.ts           # Anonymous upload
├── assets/                  # Images, fonts
├── app.json                 # Expo config
├── package.json
└── tsconfig.json
```
