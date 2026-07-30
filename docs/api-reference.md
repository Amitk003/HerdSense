# HerdSense P2P Protocol Reference

HerdSense has no backend API. Peer devices communicate directly using WebRTC DataChannels. This document describes the message format used for peer-to-peer communication.

## Connection setup

Devices connect using PeerJS (https://peerjs.com). The PeerJS cloud broker handles signaling. No connection data is stored by the broker.

1. Each device creates a Peer with a random ID
2. The device joins a room named by its 3-character geohash
3. The first device in the room becomes the hub
4. New devices connect to the hub on join
5. The hub relays reports to all connected peers

## Report message

When a device shares a stress report, it sends the following JSON over the DataChannel:

```json
{
  "type": "stress_report",
  "payload": {
    "id": "r-1722345600-1",
    "lat": 3.52,
    "lng": 38.48,
    "score": 72,
    "animalCount": 15,
    "species": "cattle",
    "timestamp": "2026-07-30T14:00:00.000Z"
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique report identifier. Format: r-{unixTimestamp}-{counter} |
| lat | number | Approximate latitude (geohash center) |
| lng | number | Approximate longitude (geohash center) |
| score | number | Herd Stress Score (0 to 100) |
| animalCount | number | Number of animals detected |
| species | string | Primary species (cattle, sheep, goat, horse, camel, donkey) |
| timestamp | string | ISO 8601 UTC timestamp |

## Sync message

On joining a room, the hub sends existing reports to the new peer:

```json
{
  "type": "sync_reports",
  "payload": {
    "reports": [
      { ...report1 },
      { ...report2 }
    ]
  }
}
```

## Ping / presence

Peers send a ping every 30 seconds to maintain the connection. If a peer does not respond for 90 seconds, it is considered disconnected and its reports are removed from the map.

```json
{
  "type": "ping"
}
```

## Privacy

- The protocol never transmits images or video
- Location is approximate (geohash center, not exact GPS)
- No device identifiers are shared
- No persistent user identity

## Limitations

- Room size is limited by WebRTC peer connections (practical max: about 20 peers per geohash)
- Reports are not persisted anywhere. When all peers disconnect, reports are lost.
- The PeerJS cloud broker is a free service and may have rate limits
