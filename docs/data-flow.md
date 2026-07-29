# Data Flow

How data moves through the HerdSense system, from capture to final output.

---

## 1. Video capture

The user opens the app and taps the record button. The phone records:

- 20 to 40 seconds of video at 30 frames per second
- Audio at 16kHz sample rate (mono)
- GPS location (if available)
- Time of day
- Ambient light level (from camera sensor)

**What gets saved on the phone:** The raw video stays on the phone. It is never uploaded anywhere.

---

## 2. Frame extraction

The video is processed in chunks:

- Every 3rd frame is extracted for analysis (10 frames per second)
- This saves battery and processing time
- Full 30fps would drain the battery too fast

---

## 3. Animal detection

Each extracted frame goes through YOLOv8-Nano running in TensorFlow Lite:

- The model finds all animals in the frame
- Returns bounding boxes (x, y, width, height) for each animal
- Returns a confidence score for each detection

---

## 4. Tracking

ByteTrack algorithm links detections across frames:

- Each animal gets a unique ID
- The system tracks where each animal moves
- Handles animals walking behind each other (re-associates them when they reappear)

---

## 5. Feature extraction

### Clustering (spacing)

For each frame, the system calculates:

- Distance between every pair of animals (centroid to centroid)
- Average distance across all pairs = Inter-Animal Spacing Index (IASI)
- Lower IASI = more bunched = higher stress

### Motion (gait)

Using optical flow on the detected animal regions:

- Average movement speed
- Speed variation (irregular walking = higher stress)
- Direction change frequency

### Posture (head position)

Using bounding box shape changes:

- Aspect ratio changes of animal boxes over time
- Indicates head raising or lowering
- Fallback measurement when keypoint detection is not available

### Audio

Audio is analyzed separately:

- Converted to spectrogram (visual representation of sound frequencies)
- Classified into: normal sounds, distress calls, silence, background noise
- Ratio of distress calls to total sounds = Vocalization Stress Ratio

---

## 6. Fusion into stress score

All four measurements are normalized to a 0-1 scale, then combined:

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
- Audio is lowest because wind and noise can interfere

---

## 7. Trend calculation

The system stores the last 5 scan results and calculates:

- Simple linear regression over time
- Output: `improving` (score dropping), `stable` (no change), `escalating` (score rising)

---

## 8. Local storage

All results are saved in a SQLite database on the phone:

- Each scan: timestamp, score, sub-scores, animal count
- Last 7 scans kept for trend display
- User can view history in the app

---

## 9. Optional sharing

If the user taps "Share Anonymized":

- Only these fields are sent: geo-hash, stress score, animal count, timestamp
- No video, no images, no audio, no personal information
- Payload is under 1KB (can be sent over SMS)
- Encrypted with AES-256-GCM

---

## 10. Backend aggregation (when shared data arrives)

1. Report is received and validated
2. Stored in H3 hexagonal grid cell
3. DBSCAN clustering checks if 3+ herds in 15km radius report score above 60
4. If yes, an alert is created
5. Map layer updates with new data point

---

## 11. Satellite comparison

Periodically (for demonstration):

- System fetches Sentinel-2 NDVI for the region
- Compares HerdSense alert date vs NDVI breach date
- Calculates lead time in days
- Displays on the timeline slider in the app

---

## Privacy summary

| Data | Stays on phone? | Can be shared? |
|------|----------------|----------------|
| Raw video | Yes | Never |
| Raw audio | Yes | Never |
| Animal images | Yes | Never |
| GPS coordinates | Yes | Only as rough geo-hash |
| Stress score | Yes | If user allows |
| Timestamp | Yes | If user allows |
| Animal count | Yes | If user allows |
| Personal info | N/A | Never collected |
