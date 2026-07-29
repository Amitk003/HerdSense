# Edge Pipeline

This document describes the browser-based analysis pipeline that runs in the user's web browser.

---

## What is the edge pipeline?

The edge pipeline is the core of HerdSense. It takes a video (from a preset or upload), runs a detection model in the browser to find animals, extracts behavioral signals, and produces a stress score. Everything runs in the browser using TypeScript and ONNX Runtime Web. No server needed.

---

## Pipeline stages

### Stage 1: Video input

Input: Pre-recorded video file (demo preset or user upload) at 30fps, 720p resolution.

The video is loaded into an HTML5 video element. Frames are drawn to a canvas for processing. Every 3rd frame is kept for processing (saves battery while keeping enough data for analysis).

### Stage 2: Animal detection

Model: YOLOv8-Nano exported to ONNX format, loaded through ONNX Runtime Web.

For each sampled frame:
- The canvas pixel data is converted to a tensor
- ONNX Runtime Web runs the model
- The model returns bounding boxes with confidence scores
- Detections below 0.5 confidence are discarded

### Stage 3: Animal tracking

Algorithm: ByteTrack (simplified for browser).

Links detections across frames so each animal keeps the same ID:
- Matches bounding boxes between consecutive frames using IoU (Intersection over Union)
- Each animal gets a unique ID
- Output: list of (frame_number, animal_id, bounding_box) for each detected animal

### Stage 4: Clustering measurement

For each frame where animals are detected, calculate:

- Centroids: center point of each animal's bounding box
- Pairwise distances: distance between every pair of centroids
- IASI: average of all pairwise distances

If animals are spread out, IASI is high (low stress signal). If animals are bunched, IASI is low (high stress signal).

### Stage 5: Motion analysis (centroid displacement)

Instead of running heavy optical flow (Farneback), we use a much simpler approach:

For each tracked animal across consecutive frames:
- Get centroid position in frame N: (x1, y1)
- Get centroid position in frame N+1: (x2, y2)
- Displacement vector: dx = x2 - x1, dy = y2 - y1
- Speed: sqrt(dx^2 + dy^2)
- Gait irregularity: variance of displacement magnitude over time
- Direction change: angle between consecutive displacement vectors

This gives the same information as optical flow (speed, gait jitter, erratic movement) but uses only 3 lines of math per animal per frame. No ML model needed, no GPU required, near-zero battery impact.

Animals under stress tend to walk faster and more erratically.

### Stage 6: Posture analysis (simplified)

Since full keypoint detection is not available for livestock, we use bounding-box heuristics:

- Track the aspect ratio of each animal's bounding box over time
- Head raising/lowering changes the aspect ratio
- Track the vertical position of the box within the frame

This is a coarse signal but works without a specialized keypoint model.

### Stage 7: Audio (input parameter)

Audio is not processed in the browser. Instead, it is a simple numeric input parameter:

```
audioDistressRatio: number (0 to 1)
```

For the demo presets, this value is pre-set based on the scenario:
- Healthy: 0.1
- Early stress: 0.5
- Critical: 0.8

This avoids building a complex audio ML pipeline for hardcoded demo data.

### Stage 8: Fusion

All measurements are normalized to 0-1 and combined in pure TypeScript:

```
hssi = 100 * (
    0.35 * cluster_score +
    0.25 * motion_score +
    0.20 * posture_score +
    0.20 * audio_score
)
```

### Stage 9: Trend and output

- Compare with last 5 scans stored in localStorage
- Calculate trend direction using linear regression
- Map score + trend to action recommendation
- Return final result

---

## Performance targets

| Metric | Target |
|--------|--------|
| Processing time per frame | Under 200ms in browser |
| Total processing time for 30s video | Under 30 seconds |
| Model size | Under 10MB (ONNX format) |
| RAM usage | Under 300MB |
| Model inference backend | ONNX Runtime Web (WebGL or WASM) |

---

## Files

```
src/pipeline/
├── detector.ts       # ONNX Runtime Web YOLOv8 wrapper
├── tracker.ts        # Centroid-based ByteTrack
├── fusion.ts         # HSSI engine (pure math, ~20 lines)
├── features.ts       # IASI + displacement + posture extraction
└── types.ts          # Shared type definitions
```
