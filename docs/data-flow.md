# HerdSense Data Flow

This document traces how data moves through the system from video to score to sharing.

## 1. Video input

Two ways to get video:
- Camera recording (20 seconds via MediaRecorder API)
- File upload (desktop fallback)

The video stays on the device. No video is ever uploaded anywhere.

## 2. Frame extraction

Detector.detectFrames() samples every 3rd frame from the video. Each frame is resized to 640x640 and converted to a float32 tensor. The tensor goes into the ONNX model.

## 3. Animal detection

YOLOv8-Nano runs on each sampled frame. It outputs bounding boxes for detected animals. The detector filters for livestock classes only (COCO classes 19 to 24: cattle, sheep, goat, horse, camel, donkey).

## 4. Tracking

ByteTrack assigns IDs to detected animals across frames. It uses IoU (Intersection over Union) to match the same animal from one frame to the next. This gives us each animal's movement path.

## 5. Feature extraction

FeatureExtractor calculates three signals from the tracking data:
- **IASI (Inter-Animal Spacing Index)**: Average distance between all detected animals. Lower IASI means they are bunched together (stress signal).
- **Motion**: Speed and direction changes of each animal across frames. Erratic movement = stress.
- **Posture**: Variance in bounding box aspect ratios. Drooping heads change the box shape.

## 6. Score calculation

The fusion engine (calcHssi) combines the three signals plus audio into a weighted score:

- Clustering: 35%
- Motion: 25%
- Posture: 20%
- Audio: 20%

The result is a number from 0 to 100.

## 7. Trend

The app stores your last 50 scans in localStorage. It compares your current score to recent scans using linear regression. The trend is improving, stable, or escalating.

## 8. Sharing

When you tap Share, the app creates a small JSON payload:
```json
{
  "id": "r-1234567890-1",
  "lat": 3.52,
  "lng": 38.48,
  "score": 72,
  "animalCount": 15,
  "species": "cattle",
  "timestamp": "2026-07-30T14:00:00Z"
}
```

This payload is sent via WebRTC DataChannel to the hub peer in your geohash room. The hub relays it to all other connected peers. No data touches any server.

## 9. Receiving

When a peer receives a report:
1. The usePeerNetwork hook adds it to the reports state
2. StressMap re-renders with the new marker on the map
3. NearbyFeed shows the new report in the list
4. findAlertClusters checks if this report creates a new alert zone
5. If yes, a toast notification appears
