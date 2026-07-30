# HerdSense Data Flow

This document explains how data moves through the system from video recording to stress scoring and peer sharing in simple language.

## 1. Video Input
- Live camera recording (20 seconds via MediaRecorder API)
- Local video file upload (fallback option)

Your raw video stays strictly on your phone or computer. Video files are never uploaded to any cloud server.

## 2. Frame Extraction & Detection
- The detector samples 2 frames per second (every 15th frame at 30fps).
- Frames are converted into tensors for YOLOv8 ONNX model inference.
- Non Maximum Suppression (NMS) removes duplicate candidate boxes per animal.

## 3. Animal Tracking
- An IoU tracker assigns consistent IDs to detected animals across sampled frames.
- Keeps track of movement vectors for each animal.

## 4. Feature Extraction & Scoring
- **Inter Animal Spatial Index (IASI)**: Measures herd crowding.
- **Motion Score**: Measures speed variance and direction change frequency.
- **Posture Score**: Measures head droop and aspect ratio variance.
- **Fusion Weighting**: Visual metrics drive 100% of the score (Clustering 40%, Motion 35%, Posture 25%) when ambient audio is not sampled.

## 5. Storage & History
- Your scan history is saved to `localStorage` (up to 50 records).
- Writes are guarded with quota error handling to prevent storage crashes on mobile browsers.

## 6. P2P Mesh Network Sharing
- When a scan completes, HerdSense creates a lightweight JSON report:
```json
{
  "id": "r-1722380000000-1",
  "lat": 1.35,
  "lng": 36.82,
  "score": 42,
  "animalCount": 12,
  "species": "cattle",
  "timestamp": "2026-07-30T14:00:00Z"
}
```
- The report is validated and sent over WebRTC DataChannel to nearby room peers within the same 100km geohash.
- Incoming network reports are validated for correct data types before rendering on the interactive map.

