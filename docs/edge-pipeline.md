# Edge Pipeline

The ML pipeline runs entirely in the browser using ONNX Runtime Web. This document explains each stage.

## Detection (YOLOv8-Nano)

Input: Video frame (1920x1080, resized to 640x640)
Output: Bounding boxes for detected animals

The model is YOLOv8-Nano trained on COCO dataset. We filter for livestock classes only:

| Class ID | Animal |
|----------|--------|
| 19 | Cattle |
| 20 | Sheep |
| 21 | Goat |
| 22 | Horse |
| 23 | Camel |
| 24 | Donkey |

The model runs on every 3rd frame to balance accuracy and speed. Each frame takes about 200ms on a mid-range phone.

## Tracking (ByteTrack)

Input: Bounding boxes from current frame + track history from previous frames
Output: Tracked animals with consistent IDs

ByteTrack works by:
1. Predicting each tracked animal's position using constant velocity model
2. Matching predictions to detections using IoU (Intersection over Union)
3. Creating new tracks for unmatched detections
4. Removing tracks that have been missing for more than 30 frames

Tracking is reset for each new video recording.

## Feature Extraction (FeatureExtractor)

Input: Tracked animals across all frames
Output: Three feature values

### IASI (Inter-Animal Spacing Index)
Average pairwise distance between all animal centroids in each frame. A low IASI means animals are bunched together, which is a stress signal.

### Motion Score
Average speed and direction changes of each animal across frames. Erratic movement indicates stress. Calculated from centroid displacement vectors.

### Posture Score
Variance in bounding box aspect ratios. Drooping heads change the box shape (less tall relative to wide). Lower variance = more uniform posture.

## Fusion (calcHssi)

Input: IASI, motion score, posture score, audio value
Output: Stress score (0 to 100)

```typescript
score = (1 - iasi) * 0.35 + motion * 0.25 + posture * 0.20 + audio * 0.20
```

Each component is normalized to 0-1 before combining. The result is mapped to 0-100.

## Audio

Audio input is a numeric slider (0 to 10) for the current demo. This placeholder exists because real audio classification is planned. The slider represents distress call intensity.
