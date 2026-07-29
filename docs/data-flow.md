# Data Flow

How data moves through the HerdSense system, from capture to final output.

---

## 1. Video selection

The user opens the web app and selects a demo preset (or uploads a video). The video is loaded into an HTML5 video element in the browser.

**What gets saved:** Nothing yet. The video is only in browser memory.

---

## 2. Frame extraction

The video is processed frame by frame using Canvas API:

- Every 3rd frame is extracted for analysis (10 frames per second)
- This saves battery and processing time
- Full 30fps would be too slow for browser inference

---

## 3. Animal detection

Each extracted frame goes through YOLOv8-Nano running in ONNX Runtime Web:

- Canvas pixel data is converted to a tensor
- The model runs in the browser using WebGL or WASM
- Returns bounding boxes (x, y, width, height) for each animal
- Returns a confidence score for each detection

---

## 4. Tracking

ByteTrack algorithm links detections across frames:

- Each animal gets a unique ID
- The system tracks where each animal moves
- Handles animals walking behind each other

---

## 5. Feature extraction

### Clustering (spacing)

For each frame, the system calculates:

- Centroids: center point of each animal's bounding box
- Pairwise distances: distance between every pair of centroids
- Average distance across all pairs = Inter-Animal Spacing Index (IASI)
- Lower IASI = more bunched = higher stress

### Motion (gait)

Using centroid displacement across frames:

- For each animal, track centroid position from frame N to N+1
- Displacement vector: (dx, dy) = (x2 - x1, y2 - y1)
- Average movement speed from displacement magnitude
- Speed variation (gait irregularity) from displacement variance
- Direction change frequency from angle between vectors

This replaces Farneback optical flow. Same information, almost zero computation.

### Posture (head position)

Using bounding box shape changes:

- Aspect ratio changes of animal boxes over time
- Indicates head raising or lowering
- Fallback measurement when keypoint detection is not available

### Audio

Audio is not analyzed in the browser. It is a preset value for each demo clip:

- Healthy: audioDistressRatio = 0.1
- Early stress: audioDistressRatio = 0.5
- Critical: audioDistressRatio = 0.8

---

## 6. Fusion into stress score

All four measurements are normalized to a 0-1 scale, then combined in TypeScript:

```
Clustering Score (35% weight)
+ Motion Score (25% weight)
+ Posture Score (20% weight)
+ Audio Score (20% weight)
= Herd Stress Score (0-100)
```

The weights reflect how reliable each signal is:
- Clustering is most reliable and works in almost all conditions
- Motion is reliable but needs animals to be moving
- Posture is a secondary signal (uses heuristics, not exact keypoints)
- Audio is lowest because it is a preset value (for demo)

---

## 7. Trend calculation

The system stores the last 5 scan results in browser localStorage and calculates:

- Simple linear regression over time
- Output: improving (score dropping), stable (no change), escalating (score rising)

---

## 8. Local storage

All results are saved in browser localStorage:

- Each scan: timestamp, score, sub-scores, animal count
- Last 7 scans kept for trend display
- User can view history in the app

---

## 9. Optional sharing

If the user taps "Share Anonymized":

- Only these fields are sent: approximate lat/lng, stress score, animal count, timestamp
- No video, no images, no audio, no personal information
- Payload is under 1KB

---

## 10. Backend aggregation (when shared data arrives)

1. Report is received and validated
2. Haversine distance formula checks if 3+ herds within 15km report score above 60
3. If yes, an alert is created
4. Map updates with new data point

---

## 11. Satellite comparison

For the demo:

- Pre-fetched Sentinel-2 NDVI data is loaded from a local file
- System compares HerdSense alert date vs NDVI breach date
- Calculates lead time in days
- Displays on the timeline slider in the app

---

## Privacy summary

| Data | Stays on device? | Can be shared? |
|------|-----------------|----------------|
| Raw video | Never uploaded | Never shared |
| Animal images | Never uploaded | Never shared |
| GPS coordinates | Yes | Only as rough lat/lng |
| Stress score | Yes (localStorage) | If user allows |
| Timestamp | Yes | If user allows |
| Animal count | Yes | If user allows |
| Personal info | N/A | Never collected |
