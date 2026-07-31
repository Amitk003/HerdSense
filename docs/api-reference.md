# HerdSense P2P Protocol Reference

HerdSense has no backend API. Peer devices communicate directly using WebRTC DataChannels through PeerJS. This document describes the real message format used by the code in `src/hooks/usePeerNetwork.ts`.

## Connection setup

PeerJS handles signaling through its public cloud broker at `0.peerjs.com`. No connection data is stored by the broker.

1. Each device resolves its location and encodes a 3-character geohash (an area of roughly 156km x 125km).
2. The device tries to register a Peer with an ID equal to the geohash. The first device to succeed becomes the room hub.
3. Devices that fail (the ID is already taken) join as members and connect to the hub.
4. The hub relays reports to all connected members and answers sync requests.

## Report message

When a scan completes, the app broadcasts a report:

```json
{
  "type": "herd_report",
  "payload": {
    "id": "r-1722384000000-1",
    "lat": 1.35,
    "lng": 36.82,
    "score": 42,
    "animalCount": 12,
    "species": "cattle",
    "timestamp": "2026-07-30T14:00:00.000Z"
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique report identifier. Format: r-{unixTimestamp}-{counter} |
| lat | number | Exact latitude from device geolocation |
| lng | number | Exact longitude from device geolocation |
| score | number | Herd stress score (0 to 100) |
| animalCount | number | Number of animals detected |
| species | string | Primary species (cattle, sheep, horse) |
| timestamp | string | ISO 8601 UTC timestamp |

Note: reports carry the exact GPS coordinates obtained from the device, not a geohash center. When geolocation is unavailable, the app falls back to a fixed default location.

## Sync message

On joining a room, a member sends a request and the hub replies with its cached reports (up to 20):

```json
{
  "type": "sync_request",
  "payload": null
}
```

```json
{
  "type": "sync_response",
  "payload": [
    { ...report1 },
    { ...report2 }
  ]
}
```

## Peer count

The hub tells members how many devices are in the room:

```json
{
  "type": "peer_count",
  "payload": 3
}
```

Members display `payload - 1` as the number of nearby users.

## Payload validation

Incoming messages are validated before use. A report must satisfy:
- id, species, timestamp are strings
- lat, lng, score, animalCount are finite numbers
- lat within -90 to 90, lng within -180 to 180
- score within 0 to 100, animalCount greater than or equal to 0

Invalid or malformed messages are ignored.

## Limits and failure behavior

- Reports are cached per device and capped at 50 (MAX_CACHED_REPORTS). Older reports are dropped.
- The room hub is a single point of failure. If the hub disconnects, members transition back to connecting but do not re-elect a new hub.
- Reports are not persisted anywhere. When all devices in a room leave, the reports are lost.
- The PeerJS cloud broker is a free service and may have rate limits.

## Privacy

- Raw video frames never leave the device.
- Reports contain only scores, species, animal counts, and location coordinates.
- Location is the device's exact GPS position, so the sharing boundary is the geohash region, not a privacy obfuscation layer.
