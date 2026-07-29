# Edge Pipeline

This document describes the on-device ML pipeline that runs on the phone.

---

## What is the edge pipeline?

The edge pipeline is the core of HerdSense. It takes a video recording from the phone camera, runs ML models to extract behavioral signals from the animals, and produces a stress score. Everything runs on the phone itself. No internet connection is needed.

---

## Pipeline stages

### Stage 1: Video input

Input: 20-40 second video at 30fps, 720p resolution.

The video is read frame by frame. Every 3rd frame is kept for processing (saves battery while keeping enough data for analysis).

### Stage 2: Animal detection

Model: YOLOv8-Nano converted to TensorFlow Lite (INT8 quantized, ~4MB).

For each sampled frame:
- The model finds all animals in the frame
- Returns bounding boxes with confidence scores
- Detections below 0.5 confidence are discarded

### Stage 3: Animal tracking

Algorithm: ByteTrack.

Links detections across frames so each animal keeps the same ID:
- When animals walk past each other, the tracker keeps them separate
- When animals leave and re-enter the frame, the tracker tries to re-assign their ID
- Output: list of (frame_number, animal_id, bounding_box) for each detected animal

### Stage 4: Clustering measurement

For each frame where animals are detected, calculate:

- Centroids: center point of each animal's bounding box
- Pairwise distances: distance between every pair of centroids
- IASI: average of all pairwise distances

If animals are spread out, IASI is high (low stress signal). If animals are bunched, IASI is low (high stress signal).

### Stage 5: Motion analysis

For each detected animal region across consecutive frames:

- Compute Farneback optical flow
- Extract: mean flow magnitude (speed), flow magnitude variance (gait irregularity), flow direction variance (erratic movement)

Animals under stress tend to walk faster and more erratically.

### Stage 6: Posture analysis (simplified)

Since full keypoint detection is not available for livestock, we use bounding-box heuristics:

- Track the aspect ratio of each animal's bounding box over time
- Head raising/lowering changes the aspect ratio
- Track the vertical position of the box within the frame

This is a coarse signal but works without a specialized keypoint model.

### Stage 7: Audio analysis

Input: Audio track extracted from the video (16kHz mono).

- Convert audio to Mel-spectrogram (128 Mel bands, 25ms window, 10ms hop)
- Classify each segment into: normal_vocalization, distress_call, silence, noise
- Calculate Vocalization Stress Ratio = distress_count / total_vocalizations

Note: For the initial demo, audio classifications are pre-labeled on the
demo videos rather than running real-time audio ML.

### Stage 8: Fusion

All measurements are normalized to 0-1 and combined:

```
hssi = 100 * (
    0.35 * cluster_score +
    0.25 * motion_score +
    0.20 * posture_score +
    0.20 * audio_score
)
```

### Stage 9: Trend and output

- Compare with last 5 scans stored in memory
- Calculate trend direction (linear regression)
- Map score + trend to action recommendation
- Return final result

---

## Performance targets

| Metric | Target |
|--------|--------|
| Processing time per frame | Under 100ms |
| Total processing time for 30s video | Under 30 seconds |
| Model size | Under 10MB total |
| Battery usage per scan | Under 5% of battery |
| RAM usage | Under 200MB |

---

## Files in this folder

```
edge/
├── models/              # Downloaded model files (TFLite, ONNX)
│   ├── yolov8n.tflite
│   └── yamnet.tflite
├── scripts/
│   ├── download_model.py    # Downloads and converts models
│   └── process_video.py     # Main video processing script
├── detection/
│   ├── detector.py          # YOLOv8 inference wrapper
│   ├── tracker.py           # ByteTrack implementation
│   └── features.py          # Feature extraction (IASI, motion, posture)
├── audio/
│   ├── classifier.py        # Audio classification
│   └── spectrogram.py       # Mel-spectrogram conversion
├── fusion/
│   ├── engine.py            # Fusion engine
│   └── weights.py           # Weight configuration
├── storage/
│   └── local_db.py          # SQLite storage for scan history
├── tests/                   # Unit tests
├── requirements.txt
└── main.py                  # Entry point
```
