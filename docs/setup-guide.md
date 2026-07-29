# Setup Guide

How to get HerdSense running on your machine.

---

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A modern web browser (Chrome, Firefox, Edge, or mobile browser)

---

## Getting the code

```
git clone https://github.com/Amitk003/HerdSense.git
cd HerdSense
```

---

## Setting up the web app

The web app is the main application. It runs entirely in the browser.

```
npm install
```

---

## Running the development server

```
npm run dev
```

This starts the Vite development server. Open the URL shown in the terminal (usually http://localhost:5173) in your browser.

---

## Building for production

```
npm run build
```

This creates a `dist/` folder with the production build. You can serve it with any static file server.

---

## Running the backend (optional)

The backend is only needed for live data aggregation. It is optional.

```
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

The server starts at `http://localhost:5000`.

---

## Running the Python dev tools (optional)

The edge/ folder contains Python scripts for model conversion and testing. These are developer tools, not part of the running application.

```
cd edge
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Download and convert the model

```
python scripts/download_model.py
```

This downloads YOLOv8-Nano and converts it to ONNX format for browser use.

---

## Running with sample data

Place demo videos in the `public/videos/` folder. The app will pick them up as demo presets.

---

## Testing

```
# Web app tests
npm run test

# Backend tests (if running)
cd backend
python -m pytest tests/
```

---

## Common issues

**ONNX Runtime Web fails to load:**
Make sure you are using a modern browser that supports WebGL. Chrome and Edge work best.

**Model not found:**
Run `npm run download-model` or place the YOLOv8 ONNX model in `public/models/`.

**App not working on phone:**
Open the development server URL on your phone (same WiFi network). For production, use the build output with a static server.

**Video not playing:**
Make sure video files are in a supported format (MP4 with H.264 codec). Place them in `public/videos/`.
