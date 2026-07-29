# Architecture

This document describes how HerdSense is built and how the different parts connect.

---

## System overview

HerdSense has two main parts:

1. **Edge layer** - Runs on the user's phone. Does all the analysis locally.
2. **Backend layer** - Optional server that collects anonymous scores from many users to build a regional stress map.

---

## Edge layer (mobile phone)

The phone app does everything without needing the internet:

```
[Camera + Mic] -> [Capture 20-40 seconds]
                        |
            +-----------+-----------+
            |                       |
            v                       v
    [Frame Sampler]         [Audio Extractor]
            |                       |
            v                       v
    [YOLOv8-Nano]           [YAMNet Classifier]
    - Animal boxes          - Distress calls
    - Tracking              - Normal sounds
    - Spacing index         - Silence detection
            |                       |
            +-----------+-----------+
                        |
                        v
              [Fusion Engine]
              Combines all signals
                        |
                        v
              [Herd Stress Score 0-100]
                        |
              +---------+---------+
              |                   |
              v                   v
      [Local Storage]     [Optional Share]
      (SQLite)            (Anonymized JSON)
```

### Components explained

**Capture module**
- Records 20-40 seconds of video at 30fps
- Records audio at 16kHz sampling rate
- Captures time of day and GPS location (if available)

**Animal detection**
- Uses YOLOv8-Nano converted to TensorFlow Lite format
- Detects animals in each video frame and draws bounding boxes around them
- ByteTrack algorithm keeps track of each animal across frames

**Motion analysis**
- Uses Farneback optical flow to measure movement patterns
- Extracts: speed, walking irregularity, direction changes

**Audio analysis**
- Converts audio to spectrograms (visual representation of sound)
- Classifies sounds into: normal calls, distress calls, silence, noise

**Fusion engine**
- Takes all measurements and combines them into one score
- Formula: HSSI = 100 x (0.35 x clustering + 0.25 x motion + 0.20 x posture + 0.20 x audio)
- Each factor is normalized from 0 to 1 before combining

**Local storage**
- Saves every scan result in SQLite database
- Keeps history for trend tracking
- Calculates if stress is improving, stable, or getting worse

---

## Backend layer

The backend is optional. It only receives data when users choose to share.

```
[Phone] -> [Anonymous Report] -> [Backend API]
                                       |
                                       v
                              [H3 Spatial Index]
                                       |
                                       v
                              [DBSCAN Clustering]
                              (Alert if 3+ herds
                               report high stress)
                                       |
                          +------------+------------+
                          |                         |
                          v                         v
                  [Regional Map]           [Satellite Overlay]
                  (Stress heatmap)         (NDVI comparison)
```

### How aggregation works

1. Each phone sends (only when user allows): geo-hash, stress score, animal count, timestamp
2. Backend groups reports by location using H3 hexagons (about 1.2km wide)
3. When 3 or more separate herds in a 15km radius all report score above 60, an alert triggers
4. The map shows a heatmap of stress across the region
5. Satellite NDVI data is shown alongside to compare detection speed

---

## Data flow (end to end)

```
Phone capture
    |
    v
On-device ML analysis (TFLite)
    |
    v
Herd Stress Score calculated
    |
    +---> Saved locally in SQLite
    |
    +---> Optional: Anonymous JSON (< 1KB) sent to backend
                |
                v
         Backend stores in H3 grid
                |
                v
         Clustering engine checks for alert conditions
                |
                v
         Map updates with new data point
```

---

## Key design principles

1. **Offline first** - Everything important works without internet
2. **Privacy by default** - No data leaves the phone unless user chooses to share
3. **Low bandwidth** - Shared reports are under 1KB (works on SMS/2G)
4. **Simple UI** - Big numbers, clear colors, minimal text for outdoor use
5. **No new hardware** - Works with any mid-range Android phone's camera and mic
