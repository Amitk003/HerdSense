# Edge Pipeline

The machine learning pipeline runs entirely in your web browser using ONNX Runtime Web. This document explains each stage in simple language.

## 1. Animal Detection (YOLOv8)

Input: Video frame (resized to 640x640 pixels).
Output: Bounding boxes around detected livestock.

The system uses a light YOLOv8 model. It filters for livestock animals:

| Class ID | Animal |
|---|---|
| 16 | Dog / Guard Dog |
| 17 | Horse |
| 18 | Sheep |
| 19 | Cattle |
| 20 | Cattle / Buffalo |
| 21 | Goat |
| 22 | Horse |
| 23 | Camel |
| 24 | Donkey |

The model samples 2 frames per second (every 15th video frame at 30fps). This balances detection speed and battery usage.

### Non Maximum Suppression (NMS)

Raw YOLOv8 detection outputs many overlapping bounding box candidates per frame. The detector runs Non Maximum Suppression with an IoU threshold of 0.45. This removes duplicate boxes so each animal is counted once.

## 2. Tracking (IoU Tracker)

Input: Bounding boxes from the current frame and track history from previous frames.
Output: Animals assigned persistent tracking IDs.

The tracker matches detections across frames:
1. Calculates Intersection over Union (IoU) overlap between frame detections.
2. Assigns existing animal IDs to matching bounding boxes.
3. Creates new IDs for newly detected animals.

## 3. Feature Extraction

Input: Tracked animals across all sampled frames.
Output: Three core physical movement metrics.

### Inter Animal Spatial Index (IASI)
Calculates the average distance between all animal center points in a frame. When animals bunch together closely, the distance drops, indicating herd stress or crowding.

### Motion Score
Calculates animal speed variance and direction change frequency. Rapid, erratic movement indicates restlessness or distress.

### Posture Score
Measures changes in bounding box aspect ratio over time. Head droop or changes in posture alter the width-to-height ratio.

## 4. Stress Score Fusion

Input: Spatial clustering score, motion score, posture score.
Output: Herd Stress Score (0 to 100).

```typescript
rawScore = (clustering * 0.40) + (motion * 0.35) + (posture * 0.25)
score = Math.round(rawScore * 100)
```

Visual metrics drive 100% of the score when no external audio data is provided. When audio distress signals are present, audio is factored into the calculation.

