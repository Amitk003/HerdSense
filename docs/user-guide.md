# HerdSense User Guide

## Getting Started

Open HerdSense in your mobile browser (Chrome, Safari, Firefox). You can tap "Add to Home Screen" to install it as a Progress Web App (PWA) with full offline support.

## Keyboard Accessibility
HerdSense fully supports keyboard navigation:
- Press `Tab` to navigate between action buttons and cards.
- Press `Enter` or `Space` to activate navigation options.

## Scanning Your Herd

### 1. Record Live Video
1. Tap "Record" on the home screen.
2. Point your phone camera at your herd.
3. Tap "Start Recording (20s)".
4. Analysis runs on your phone. Processing a 20-second clip takes longer on older devices.

### 2. Upload Video File
1. Tap "Upload" on the home screen.
2. Select a video file of your livestock.
3. The AI processes the video locally.

## Understanding the Stress Score

| Score | Status | Recommendation |
|---|---|---|
| 0 to 35 | Green | Herd looks healthy. No change needed. |
| 36 to 65 | Yellow | Some stress signs. Keep watching. |
| 66 to 100 | Red | High stress. Take immediate action. |

Score breakdown:
- **Clustering**: Measures how tightly packed animals are.
- **Motion**: Measures speed variance and erratic movements.
- **Posture**: Measures head droop and aspect ratio changes.

## Automatic Sharing & Maps

- **Auto-Shared**: When a scan finishes, a report with the score, species, animal count, and location is shared over WebRTC with nearby farmers in your geohash region (roughly 150km across).
- **Interactive Map**: Tap "Map" to see nearby herd reports and active cluster alerts.
- **Scan History**: Tap "History" to review your previous scans saved on your device.

