# Architecture

This document describes how HerdSense is built and how the different parts connect.

---

## System overview

HerdSense has two main parts:

1. **Browser layer** - Runs in the user's phone browser. Does all the analysis locally using ONNX Runtime Web.
2. **Backend layer** - Optional server that collects anonymous scores from many users to build a regional stress map.

---

## Browser layer

The web app does everything without needing the internet (after the page loads):

```
[Video Upload / Preset]
        |
        v
[Canvas Frame Extractor]
   (every 3rd frame)
        |
        v
[ONNX Runtime Web - YOLOv8]
   - Animal bounding boxes
   - Confidence scores
        |
        v
[ByteTrack Tracker]
   - Animal IDs across frames
   - Centroid tracking
        |
        v
[Feature Extraction]
   - IASI (clustering)
   - Centroid displacement (motion)
   - Box aspect ratio (posture)
        |
        v
[Fusion Engine]
   Combines all signals
        |
        v
[Herd Stress Score 0-100]
        |
    +---+---+
    |       |
    v       v
[localStorage]  [Optional Share]
(history)       (anonymous JSON)
```

### Components explained

**Capture**
- For the demo: user selects a pre-recorded preset video
- Video is loaded into a hidden HTML5 video element
- Frames are drawn to a canvas for processing

**Frame extraction**
- Every 3rd frame is extracted from the video (10 fps from 30fps source)
- Canvas API captures pixel data from each frame

**Animal detection**
- YOLOv8-Nano model runs through ONNX Runtime Web (in the browser)
- Detects animals in each frame and returns bounding boxes
- Detections below 0.5 confidence are discarded

**Tracking**
- ByteTrack algorithm links detections across frames
- Each animal gets a unique ID
- Tracks where each animal moves across frames

**Clustering measurement**
- Calculate centroid for each animal's bounding box
- Compute distance between every pair of centroids
- Average distance = Inter-Animal Spacing Index (IASI)
- Lower IASI = more bunched = higher stress

**Motion analysis**
- Track centroid position of each animal across consecutive frames
- Calculate displacement vectors (dx, dy)
- Extract: speed, gait irregularity, direction change frequency
- This replaces Farneback optical flow - same result, 0.01% of the computation

**Posture analysis**
- Track bounding box aspect ratio over time
- Head raising/lowering changes the aspect ratio
- Coarse signal but works without keypoint models

**Audio**
- Treated as a simple numeric input parameter (0 to 1)
- For demo, this value is pre-set for each video preset
- No audio ML pipeline in the browser

**Fusion engine**
- Pure TypeScript math, no external dependencies
- HSSI = 100 x (0.35 x clustering + 0.25 x motion + 0.20 x posture + 0.20 x audio)
- Each factor is normalized from 0 to 1 before combining

**Local storage**
- Saves scan results in browser localStorage
- Keeps history for trend tracking
- Calculates if stress is improving, stable, or getting worse

---

## Backend layer

The backend is optional. It only receives data when users choose to share. For the demo, the backend is simulated with mock data.

```
[Browser] -> [Anonymous Report] -> [Backend API]
                                       |
                                       v
                              [Simple Report Store]
                                       |
                                       v
                              [Haversine Clustering]
                              (Alert if 3+ herds
                               within 15km report
                               score above 60)
                                       |
                              +--------+--------+
                              |                 |
                              v                 v
                      [Regional Map]   [Satellite Overlay]
                      (Stress markers)  (NDVI comparison)
```

### How aggregation works

1. Each browser sends (only when user allows): lat/lng, stress score, animal count, timestamp
2. Backend stores reports
3. Haversine distance formula checks: are there 3+ herds within 15km radius all reporting score above 60?
4. If yes, an alert triggers
5. The map shows markers colored by stress score
6. Satellite NDVI data is shown alongside to compare detection speed

---

## Data flow (end to end)

```
Browser opens web app
    |
    v
User selects demo preset
    |
    v
Video plays through HTML5 video element
    |
    v
Canvas extracts frames (every 3rd)
    |
    v
ONNX Runtime Web runs YOLOv8 on each frame
    |
    v
Bounding boxes + tracking IDs
    |
    v
Features extracted: IASI, displacement, aspect ratio
    |
    v
Fusion engine calculates HSSI
    |
    v
Results shown to user with score dial and recommendation
    |
    +---> Saved in localStorage for history
    |
    +---> Optional: Anonymous JSON sent to backend
                |
                v
         Backend stores report
                |
                v
         Haversine clustering checks alert conditions
                |
                v
         Map updates with new data point
```

---

## Key design principles

1. **Offline first**: Everything important works without internet after page load
2. **Privacy by default**: No data leaves the browser unless user chooses to share
3. **Low bandwidth**: Shared reports are under 1KB
4. **Simple UI**: Big numbers, clear colors, minimal text for outdoor use
5. **No new hardware**: Works with any phone's browser
6. **No Python on client**: Everything runs in TypeScript/JavaScript in the browser
7. **No heavy dependencies**: Centroid math replaces optical flow, Haversine replaces DBSCAN
