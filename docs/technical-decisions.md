# Technical Decisions

This document explains why each technology was chosen. This helps anyone working on the project understand the reasoning.

---

## YOLOv8-Nano for animal detection

**Chosen over:** YOLOv5, MobileNet-SSD, Faster R-CNN

**Reason:**
- YOLOv8-Nano is the smallest YOLOv8 model (about 4MB when quantized)
- It can run in real-time on mid-range phone hardware
- COCO dataset pre-training already includes cow, horse, sheep classes - no custom training needed for basic detection
- Good balance of speed and accuracy for our use case

---

## ONNX Runtime Web for browser inference

**Chosen over:** TensorFlow.js, TensorFlow Lite

**Reason:**
- Runs YOLOv8 in the browser with WebGL or WASM backend
- No Python or native code needed on the client
- Works on any device with a browser (phone, tablet, laptop)
- Avoids the React Native + Python bridge problem entirely
- ONNX format is widely supported and easy to convert to

---

## ByteTrack for object tracking

**Chosen over:** DeepSORT, StrongSORT, BoT-SORT

**Reason:**
- Does not need a separate re-identification model (lighter weight)
- Works well in crowded scenes where animals cross paths
- Simple to implement and tune
- Good performance on CPU

---

## Centroid displacement vectors for motion analysis

**Chosen over:** Farneback optical flow, DeepFlow, RAFT, FlowNet

**Reason:**
- Farneback optical flow is a dense pixel-level operation that burns CPU and battery on phones
- We already have bounding boxes from YOLOv8 - the centroid of each box gives us animal position
- Tracking centroid (dx, dy) across frames gives: speed, gait irregularity, direction changes
- This is 3 lines of vector math vs 100+ lines of OpenCV optical flow
- 0.01% of the CPU usage for the same outcome
- This was the single biggest optimization recommendation from review

---

## Audio as numeric parameter

**Chosen over:** YAMNet, custom audio classifier, Mel-spectrogram pipeline

**Reason:**
- For the demo, audio classifications are pre-set per video preset
- Building a real-time audio ML pipeline in the browser adds complexity with zero benefit for hardcoded demo data
- Audio is treated as a simple numeric input (0 to 1) to the fusion engine
- A real audio pipeline can be added later without changing the fusion engine
- No code is written for audio processing that will not be used in the demo

---

## Vite + React + TypeScript for web app

**Chosen over:** React Native, Flutter, pure HTML/JS, Next.js

**Reason:**
- Vite is fast for development (instant hot reload)
- React has the largest developer pool
- TypeScript catches errors during development
- Works as a PWA - can be saved to phone home screen
- No app store deployment needed
- Single codebase for all platforms

---

## Leaflet for maps

**Chosen over:** Mapbox, Google Maps, Deck.gl

**Reason:**
- Completely free, no API keys needed
- Lightweight and works offline
- Simple API for markers and popups
- react-leaflet makes React integration easy

---

## Haversine distance for clustering

**Chosen over:** Uber H3 spatial indexing, scikit-learn DBSCAN

**Reason:**
- For 10-50 data points, H3 and DBSCAN are overengineered
- The Haversine formula calculates great-circle distance between two lat/lng points
- Checking "are there 3+ points within 15km radius with score > 60" is a simple loop
- About 15 lines of math, zero external dependencies
- Faster cold start, simpler deployment, easier to understand

---

## Pre-fetched Sentinel-2 NDVI for satellite comparison

**Chosen over:** Live API calls, MODIS, Landsat

**Reason:**
- Sentinel-2 has 10m resolution (best free option)
- Pre-fetching avoids API rate limits and network issues during demo
- 10-15 day revisit time is fine for showing lead-time comparison
- Copernicus Open Access Hub is free

---

## Flask + SQLite for backend

**Chosen over:** FastAPI, Django, Node.js

**Reason:**
- Simplest setup for a lightweight API
- SQLite is enough for demo-scale data
- Easy to understand for new contributors
- Can be replaced with FastAPI later if needed
- Only used if live aggregation is needed

---

## Why NOT full keypoint/pose estimation

**We chose NOT to do MediaPipe-style keypoint detection for livestock.**

Reason:
- MediaPipe is trained on humans, not quadrupeds
- Training a livestock keypoint model needs thousands of labeled images
- Ear angle and head droop are very hard to measure from a phone video in field conditions (dust, occlusion, distance)
- Instead we use bounding-box aspect ratio heuristics - less precise but far more reliable

---

## Why NOT custom YOLO training (for now)

**We use COCO pre-trained weights without fine-tuning.**

Reason:
- COCO already includes cow, horse, sheep classes
- For the demo, pre-trained detection is good enough
- Custom training on livestock data is better left for production
- Saves weeks of data collection and labeling effort

---

## Why NOT Farneback optical flow

**We chose centroid displacement vectors instead.**

Reason:
- Farneback flow processes every pixel in the image - computationally expensive
- On a phone, running Farneback alongside YOLOv8 causes overheating and throttling
- We already have bounding box centroids from tracking
- Centroid displacement (dx, dy between frames) gives the same motion information
- Speed: magnitude of (dx, dy)
- Gait irregularity: variance of displacement across frames
- Direction changes: angle between consecutive displacement vectors
- All with 3 lines of math instead of 100+ lines of OpenCV
