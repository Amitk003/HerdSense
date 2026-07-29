# HerdSense

**Livestock as the primary early-warning sensor network.**

No satellites. No IoT collars. No hardware. Just a phone and the herd.

---

## What is HerdSense?

HerdSense is a mobile application that turns your phone into an livestock stress detection tool. Point your phone at the herd, record 20 seconds of video, and get a clear stress score from 0 to 100. All processing happens on your phone. No internet required.

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
Analysis runs entirely on your phone. No cell signal needed. No data plan needed.

**You control your data.**
Nothing leaves your phone unless you choose to share an anonymous summary. No images. No video. Just a number and a rough location.

---

## How it works

1. Open the app and point your phone at the herd
2. Record 20 to 40 seconds of video
3. The app analyzes the video on your phone using computer vision and audio models
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
| Animal detection | YOLOv8-Nano -> TensorFlow Lite |
| Object tracking | ByteTrack |
| Motion analysis | OpenCV Farneback optical flow |
| Fusion engine | Python (NumPy + SciPy) |
| Audio classification | YAMNet (custom fine-tuned) |
| Mobile app | React Native (Expo) |
| Map visualization | Leaflet + H3 spatial indexing |
| Backend API | Flask + SQLite |
| Satellite comparison | Sentinel-2 NDVI (Copernicus) |

### Project structure

```
herdsense0/
├── edge/             # On-device ML pipeline source code
├── backend/          # Backend aggregation server
├── docs/             # Documentation
├── data/             # Sample data and model files
└── README.md
```

See `docs/setup-guide.md` to get started.

---

## Status

This project is under active development.
