# Edge Pipeline

The ML pipeline runs entirely in the browser using ONNX Runtime Web. This document explains each stage as it exists in the code.

## Detection (YOLOv8-Nano)

Input: video frames resized to 640x640
Output: bounding boxes for detected animals

The model is a YOLOv8-Nano checkpoint trained on the COCO dataset. It runs on every 15th frame (2 frames per second at 30fps) to balance accuracy and speed. Inference uses the WebGL execution provider with a WebAssembly fallback. Model loading enables WASM multithreading and waits on a 100ms seek timeout per sampled frame.

### Preprocessing

Each sampled frame is drawn onto a 640x640 canvas, converted to a planar RGB float tensor with values scaled to 0-1, and passed to the model as shape [1, 3, 640, 640].

### Output parsing

The model returns a [1, 84, 8400] tensor: 4 box coordinates plus 80 class scores for each of 8400 candidate boxes. Coordinates are normalized to image size, and only livestock classes are kept:

| Class ID | Species |
|----------|---------|
| 17 | Horse |
| 18 | Sheep |
| 19 | Cattle |

### Filtering

- Confidence threshold: 0.25
- Non Maximum Suppression (NMS) with an IoU threshold of 0.45. Suppression is class-aware: overlapping boxes are only removed when they share the same class, so a horse beside a cow is not falsely deleted.

## Tracking

The tracker assigns consistent IDs to detected animals using a greedy IoU matcher.

1. For each new box, find the existing track with the highest IoU above 0.3.
2. Reuse that track's ID, otherwise create a new track.
3. Increment a gap counter for tracks with no match.
4. Remove tracks that have been missing for more than 5 sampled frames.

Tracking resets for each new recording or upload.

## Feature Extraction (FeatureExtractor)

### IASI (Inter Animal Spacing Index)

Average pairwise distance between all animal centroids in each frame. A low IASI means animals are bunched together, which is a stress signal.

### Motion Score

Speed variance and direction change frequency across frames, measured from centroid displacement vectors. Erratic movement indicates stress.

### Posture Score

Variance in bounding box aspect ratios over time. Drooping heads change the box shape (less tall relative to wide), which increases ratio variance.

## Fusion (calcHssi)

Input: clustering score, motion score, posture score, audio value
Output: stress score from 0 to 100

When ambient audio is not captured (the current default), visual metrics drive the full score:

```
score = clustering * 0.40 + motion * 0.35 + posture * 0.25
```

When an audio distress value is supplied, the weights become:

```
score = clustering * 0.35 + motion * 0.30 + posture * 0.20 + audio * 0.15
```

The IASI is normalized against a maximum expected value of 450 pixels (roughly half the diagonal of the 640x640 canvas). The final score is clamped to 0-100.

## Audio

Audio capture is not yet implemented. The fusion engine accepts an audio distress value, but the camera flow currently passes 0. This is a planned improvement, not an active feature.

## Trend

The trend (improving, stable, or escalating) is computed with linear regression over the last three saved scan scores plus the current score. A slope with absolute value below 2 is treated as stable.
