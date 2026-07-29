# HerdSense

**Livestock as the primary early-warning sensor network.**

No satellites. No IoT collars. No hardware. Just a phone and the herd.

---

## What is HerdSense?

HerdSense is a web application that turns your phone into a livestock stress detection tool. Point your phone at the herd, record 20 seconds of video, and get a clear stress score from 0 to 100. All processing happens in your browser. No internet required after the page loads.

It measures things your animals are already telling you:
- Are they bunching together more than normal?
- Is their walking pattern changing?
- Are they making distress sounds?
- Are their heads drooping?

These signals appear days to weeks before satellite systems detect any problem. HerdSense just makes them visible and measurable.

---

## Why HerdSense?

**Current early-warning systems have a problem.**
Satellites measure vegetation greenness (NDVI) and rainfall to predict drought. But by the time the satellite sees a problem, livestock have already been stressed for 10 to 14 days. Milk production drops. Body condition falls. The window for action is gone.

**Animals know before satellites do.**
Livestock change their behavior when forage quality drops or water becomes scarce. They bunch up. They walk differently. They make different sounds. Pastoralists have always known this. HerdSense amplifies this knowledge.

**No new hardware.**
The phone in your pocket is enough. No collars. No sensors. No installation.

**Works offline.**
Analysis runs entirely in your browser. No cell signal needed. No data plan needed. Once the page loads, it works without any connection.

**You control your data.**
Nothing leaves your phone unless you choose to share an anonymous summary. No images. No video. Just a number and a rough location.

---

## How it works

1. Open the web app on your phone
2. Tap a demo preset or upload a video of your herd
3. The app analyzes the video in your browser using computer vision
4. You get a Herd Stress Score from 0 to 100 with a recommended action
5. Optionally share an anonymous summary to help build a regional stress map

---

## What you can do with it

- **Early warning**: Know when your herd is under stress before it becomes a crisis
- **Movement decisions**: Get clear recommendations on when to move to better grazing or water
- **Regional awareness**: See stress levels across nearby herds (when others choose to share)
- **Historical tracking**: See how your herd's stress levels change over days and weeks

---

## For developers

### Tech stack

| Component | Technology |
|-----------|-----------|
| Animal detection | YOLOv8-Nano through ONNX Runtime Web |
| Object tracking | ByteTrack (centroid-based) |
| Motion analysis | Centroid displacement vectors (dx, dy) |
| Fusion engine | TypeScript (pure math, no frameworks) |
| Audio input | Simple numeric parameter (pre-labeled for demo) |
| Web app | Vite + React + TypeScript |
| Map visualization | Leaflet + Haversine clustering |
| Backend API | Flask + SQLite (optional) |
| Satellite comparison | Pre-fetched Sentinel-2 NDVI |

### Project structure

```
herdsense0/
├── src/              # Web application source code
├── public/           # Static assets and model files
├── edge/             # Python dev tools (model conversion, testing)
├── backend/          # Optional backend server
├── docs/             # Documentation
├── data/             # Sample data and model files
└── README.md
```

---

## Project status

This project is under active development.
