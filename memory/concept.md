# HerdSense System Concept & Research

## Problem Statement
Pastoralists and livestock farmers in remote, low-connectivity regions face severe challenges detecting early signs of disease, environmental heat stress, and herd distress. Traditional cloud-based AI solutions fail due to high cellular bandwidth costs, intermittent network access, and centralized server latency.

## Core Solution Architecture
HerdSense solves this through a decentralized, offline-first approach:

1. **Browser-Based Edge ML Pipeline**:
   - Runs YOLOv8 object detection in client-side WebAssembly / WebGL.
   - Extracts key biometrics from standard smartphone video:
     - **Inter-Animal Spatial Index (IASI)**: Measures herd clustering and crowding.
     - **Kinematic Speed & Heading**: Measures restlessness vs lethargy.
     - **Posture Variance**: Measures head-droop and posture changes over time.

2. **Serverless Mesh Alert Network**:
   - Encodes user location into coarse geohashes to group nearby farmers automatically.
   - Shares aggregated herd stress scores over WebRTC without uploading private video files.
   - Visualizes regional stress clusters on interactive offline Leaflet maps.

3. **Privacy First Design**:
   - Raw video frames never leave the device.
   - Only mathematical stress metrics and the report's GPS coordinates are broadcasted. The geohash is used solely as the peer-sharing boundary, not as a location obfuscation layer; reports carry the device's exact lat/lng so the map and distance calculations stay accurate.

## Future Improvements & Scaling

### Accuracy
- **Fine-tuned livestock model**: current YOLOv8-Nano is COCO pretrained and only reliably detects cattle, sheep, and horses. Fine-tune on a livestock dataset to add goats, donkeys, and camels, and to improve per-breed bounding-box precision.
- **More training data & augmentation**: collect field videos across lighting, camera angle, herd density, and season to harden detection against real-world conditions (dust, low light, occlusions).
- **Multimodal stress signals**: capture and classify ambient audio distress calls during the scan. The fusion engine already reserves an audio weight; wire it to a small on-device audio classifier.
- **Cross-validation against ground truth**: partner with veterinarians or smallholder farms to calibrate the 0-100 scale against observed stress states per species and season.

### Performance
- **WebGPU execution provider**: move inference from WebGL to WebGPU for faster, more battery-efficient on-device scoring on modern phones.
- **Streaming inference**: shift from post-capture sampling to near-real-time frame-by-frame detection with a live bounding-box overlay on the camera preview.
- **Quantized / distilled model**: use INT8 quantization or a distilled variant of YOLOv8-Nano to shrink the 13MB model and speed up load and inference.

### Networking & Scale
- **Resilient mesh**: auto re-election of the room hub when the current hub disconnects, and automatic report expiry so stale markers clear from the map.
- **Peer relay / multi-hop**: relay reports through intermediate peers so regions with sparse concurrent users still get regional coverage.
- **Room scaling**: tune geohash granularity (current 3-char cells are ~150km across) and add capped room sizes to avoid flooding dense areas.

### Offline & Accessibility
- **Offline map tiles**: bundle or cache regional OpenStreetMap tiles so the map is fully usable without a connection.
- **Local language support**: localize the interface and recommendations into the languages of the pastoralist communities that use it.

### Product & Distribution
- **History synchronization**: persist scan history across a herd/community rather than per-device localStorage only.
- **Guided onboarding**: add an in-app calibration walkthrough so new users frame and record usable videos the first time.
- **Deployment hardening**: continue automated CI/CD (Vercel + GitHub Actions) and expand the Vitest suite to cover detector NMS and feature extraction edge cases.
