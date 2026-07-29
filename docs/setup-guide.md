# Setup Guide

How to get HerdSense running on your machine.

---

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn
- Git
- A phone or emulator (for mobile app)
- OpenCV compatible camera (for testing capture)

---

## Getting the code

```
git clone https://github.com/Amitk003/HerdSense.git
cd HerdSense
```

---

## Setting up the edge pipeline

The edge pipeline is the core ML system that analyzes videos.

```
cd edge
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Requirements

Create `edge/requirements.txt` with:

```
numpy>=1.24.0
opencv-python>=4.8.0
opencv-contrib-python>=4.8.0
tensorflow>=2.13.0
ultralytics>=8.0.0
onnxruntime>=1.15.0
librosa>=0.10.0
scipy>=1.11.0
matplotlib>=3.7.0
flask>=3.0.0
flask-cors>=4.0.0
gunicorn>=21.2.0
```

### Download the model

```
python scripts/download_model.py
```

This downloads YOLOv8-Nano and converts it to TFLite format.

---

## Setting up the mobile app

```
cd mobile
npm install
```

For iOS (if developing on Mac):

```
cd ios && pod install && cd ..
```

---

## Setting up the backend

```
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

---

## Running locally

### Run the edge pipeline

```
cd edge
python main.py --input path/to/video.mp4
```

### Run the backend server

```
cd backend
python app.py
```

The server starts at `http://localhost:5000`.

### Run the mobile app

```
cd mobile
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator.

---

## Running with sample data

Download sample videos from the data folder:

```
cd data
python download_samples.py
```

Then run the pipeline:

```
cd edge
python main.py --input ../data/samples/healthy_herd.mp4
python main.py --input ../data/samples/stressed_herd.mp4
```

---

## Testing

```
cd edge
python -m pytest tests/

cd backend
python -m pytest tests/

cd mobile
npx jest
```

---

## Common issues

**OpenCV not working:**
Make sure you have Visual C++ redistributable installed on Windows.

**TFLite model not found:**
Run `python scripts/download_model.py` first.

**Camera not working on emulator:**
Use a real phone for testing camera features.

**Expo build failing:**
Clear cache: `npx expo start -c`
