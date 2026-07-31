# Technical Decisions

## Why ONNX Runtime Web instead of TensorFlow.js?

ONNX Runtime Web supports WebGL and WebGPU execution providers. This means ML inference can use the phone's GPU, which is much faster than CPU-only TensorFlow.js. YOLOv8 exports to ONNX natively, so no conversion step is needed.

## Why a simple IoU tracker instead of ByteTrack or DeepSORT?

The tracker is a greedy IoU matcher (about 90 lines) rather than ByteTrack or DeepSORT. It matches each new box to the existing track with the highest overlap and reuses that track's ID. It needs no appearance model or motion prediction. For livestock, animals look similar, so appearance-based tracking adds little value, and the short 20-second scan window keeps tracking simple and reliable.

## Why centroid displacement instead of optical flow?

Optical flow (Farneback) is computationally expensive and needs a separate implementation. Centroid displacement is a simple calculation: track the center point of each bounding box and measure how far it moves between frames. Three lines of math. Same stress signal.

## Why Vite + React instead of Next.js or Create React App?

Vite is the fastest dev server for React projects. It creates a static site output that can be deployed anywhere. No server-side rendering needed since all ML runs in the browser. PWA support is straightforward.

## Why Leaflet instead of Mapbox or Google Maps?

Leaflet is free. No API key needed. No usage limits. Works offline. The map features we need (markers, circles, tile layers) are all built-in.

## Why Haversine instead of H3 or DBSCAN?

Haversine is a single math formula (15 lines of code). H3 requires an external library. DBSCAN needs a spatial index. Haversine does the same job: find points within a radius. For a few dozen to a few hundred points, it is fast enough.

## Why PeerJS instead of raw WebRTC?

PeerJS wraps the WebRTC signaling process in a simple API. Without it, we would need to run a signaling server. PeerJS provides a free cloud broker that handles signaling for us. The data itself never touches their servers - only the connection setup.

## Why no backend?

A backend would store user data, which creates privacy risks and operational costs. The P2P approach means no data is ever stored on a server. The app works fully offline when alone and better when connected. Zero hosting cost.

## Why geohash for grouping peers?

Geohash (3 characters, roughly 156km x 125km) groups nearby devices into rooms so reports reach only relevant neighbors. It avoids the need for a server to discover who is nearby. The geohash sets the sharing boundary, but reports themselves carry the device's exact GPS coordinates, so it is not a location obfuscation layer. Keeping exact coordinates in the report lets the map and distance calculations stay accurate.

## Why localStorage instead of IndexedDB or SQLite?

localStorage is simpler and synchronous. We only store small amounts of data (stress scores, not videos). The limit is 5-10MB, which is enough for years of daily scores. No asynchronous API to manage.
