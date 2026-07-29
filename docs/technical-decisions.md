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

## TensorFlow Lite for on-device inference

**Chosen over:** ONNX Runtime, CoreML, PyTorch Mobile

**Reason:**
- Best support for Android devices
- INT8 quantization reduces model size by 75% with minimal accuracy loss
- GPU delegate acceleration available on most phones
- Largest community and tooling support

---

## ByteTrack for object tracking

**Chosen over:** DeepSORT, StrongSORT, BoT-SORT

**Reason:**
- Does not need a separate re-identification model (lighter weight)
- Works well in crowded scenes where animals cross paths
- Simple to implement and tune
- Good performance on CPU

---

## Farneback optical flow for motion analysis

**Chosen over:** DeepFlow, RAFT, FlowNet

**Reason:**
- No ML model needed - runs entirely on CPU
- Fast enough for real-time at 10fps on phone hardware
- Good enough quality for gait analysis (we need changes in movement patterns, not pixel-perfect flow)
- No GPU required, saves battery

---

## React Native (Expo) for mobile app

**Chosen over:** Flutter, native Kotlin/Swift, PWA

**Reason:**
- Cross-platform from one codebase (Android primary, iOS secondary)
- Expo has good camera and audio APIs
- Large developer pool
- Can integrate native TFLite modules when needed
- Faster development than native for prototyping

---

## Flask for backend server

**Chosen over:** FastAPI, Django, Node.js

**Reason:**
- Simplest setup for a lightweight API
- SQLite is enough for demo-scale data
- Easy to understand for new contributors
- Can be replaced with FastAPI later if needed

---

## Leaflet + H3 for maps

**Chosen over:** Mapbox, Google Maps, Deck.gl

**Reason:**
- Completely free, no API keys needed
- H3 hexagonal grid is the standard for spatial aggregation
- Leaflet is lightweight and works offline
- H3-js library makes hex binning easy

---

## Pre-fetched Sentinel-2 NDVI for satellite comparison

**Chosen over:** Live API calls, MODIS, Landsat

**Reason:**
- Sentinel-2 has 10m resolution (best free option)
- Pre-fetching avoids API rate limits and network issues during demo
- 10-15 day revisit time is fine for showing lead-time comparison
- Copernicus Open Access Hub is free

---

## Why NOT full keypoint/pose estimation

**We chose NOT to do MediaPipe-style keypoint detection for livestock.**

Reason:
- MediaPipe is trained on humans, not quadrupeds
- Training a livestock keypoint model needs thousands of labeled images
- Ear angle and head droop are very hard to measure from a phone video in field conditions (dust, occlusion, distance)
- Instead we use bounding-box heuristics and optical flow - less precise but far more reliable

---

## Why NOT custom YOLO training (for now)

**We use COCO pre-trained weights without fine-tuning.**

Reason:
- COCO already includes cow, horse, sheep classes
- For the demo, pre-trained detection is good enough
- Custom training on livestock data is better left for production
- Saves weeks of data collection and labeling effort
