# HerdSense - Pitch Script (3 min)

## Hook (30s)

This herder in northern Kenya knows his animals are in trouble two weeks before any satellite agrees. We built the tool that proves him right.

HerdSense turns a standard phone camera into an early-warning system for drought. No new hardware. No internet required. You point, you record, and the phone reads the animals.

## The Gap (30s)

Current early-warning systems rely on satellite NDVI. The problem: satellites detect vegetation stress 10-14 days after it starts. By then, livestock have already lost condition. Milk production has dropped. The window for action is gone.

There is a structural 2-week blind spot in every drought early-warning system on the planet.

## The Insight (30s)

Animals signal trouble before satellites do. When cattle bunch tightly, change their gait, or increase distress calls, it means forage or water is running out. Pastoralists have known this for millennia, but their knowledge has no channel into institutional early-warning systems.

HerdSense bridges that gap. It makes the animal the sensor.

## How It Works (45s)

Open the web app, tap a demo preset. The browser runs ML models locally:

1. Animal detection tracks every animal in the frame
2. Inter-animal spacing measures how tightly they bunch
3. Centroid displacement vectors analyze gait changes
4. A fusion engine combines these into a single Herd Stress Score (0-100)

The key math decisions keep it lean: centroid vectors replace optical flow (3 lines vs 300), Haversine distance replaces DBSCAN clustering (15 lines vs a library), everything runs in TypeScript.

A herder can share an anonymous summary - just score and location, no video, no audio.

## The Network Effect (30s)

One report is useful. Ten reports from independent herds within 15km create a verified alert. When 3+ herds all show stress scores above 60, the system flags an alert zone.

The regional stress map on the app shows this in real time. HerdSense markers appear days before the satellite NDVI overlay even changes.

## The Result (15s)

11 days lead time. That is the gap between what animals know and what satellites see. HerdSense closes it.

The animals are already telling us. We just built the listener.
