# API Reference

Documentation for all API endpoints in the HerdSense backend.

---

## Base URL

When running locally: `http://localhost:5000`

---

## Endpoints

### Health check

```
GET /api/health
```

Returns server status.

Response:
```json
{
    "status": "ok",
    "version": "0.1.0"
}
```

---

### Submit stress report

```
POST /api/reports
```

Submit a stress reading from a phone. This is the main ingestion endpoint.

Request body:
```json
{
    "geo_hash": "h3_hex_id_here",
    "stress_score": 72,
    "animal_count": 15,
    "species": "cattle",
    "timestamp": "2026-07-29T14:30:00Z"
}
```

Fields:
- `geo_hash` (required): H3 hexagon id at resolution 6. About 1.2km precision.
- `stress_score` (required): Integer from 0 to 100.
- `animal_count` (optional): Number of animals detected.
- `species` (optional): Type of livestock (cattle, goat, sheep, camel).
- `timestamp` (required): ISO 8601 timestamp.

Response:
```json
{
    "status": "accepted",
    "report_id": "abc123",
    "message": "Report recorded. Thank you."
}
```

---

### Get regional stress map

```
GET /api/map?lat=3.5&lng=38.5&radius=50
```

Get aggregated stress data for a region.

Query parameters:
- `lat` (required): Center latitude
- `lng` (required): Center longitude
- `radius` (required): Search radius in kilometers
- `hours` (optional): Only include reports from last N hours. Default 72.

Response:
```json
{
    "center": {"lat": 3.5, "lng": 38.5},
    "radius_km": 50,
    "report_count": 12,
    "average_score": 58,
    "hexagons": [
        {
            "id": "h3_hex_id",
            "avg_score": 72,
            "report_count": 3,
            "lat": 3.52,
            "lng": 38.48
        }
    ],
    "alerts": [
        {
            "region": "hex_id",
            "avg_score": 74,
            "herd_count": 4,
            "triggered_at": "2026-07-29T12:00:00Z"
        }
    ]
}
```

---

### Get herd history

```
GET /api/history?herd_id=abc123
```

Get the stress score history for a specific herd.

Query parameters:
- `herd_id` (required): Anonymous herd identifier
- `days` (optional): Number of days of history. Default 30.

Response:
```json
{
    "herd_id": "abc123",
    "days": 30,
    "readings": [
        {
            "score": 22,
            "timestamp": "2026-07-01T08:00:00Z"
        },
        {
            "score": 35,
            "timestamp": "2026-07-05T08:00:00Z"
        }
    ],
    "trend": "escalating"
}
```

Trend values: `improving`, `stable`, `escalating`

---

### Get satellite comparison

```
GET /api/satellite-comparison?lat=3.5&lng=38.5&days=30
```

Get satellite NDVI data for comparison with HerdSense scores.

Query parameters:
- `lat` (required): Latitude
- `lng` (required): Longitude
- `days` (optional): Lookback period in days. Default 30.

Response:
```json
{
    "location": {"lat": 3.5, "lng": 38.5},
    "ndvi_readings": [
        {"date": "2026-07-01", "ndvi": 0.45},
        {"date": "2026-07-05", "ndvi": 0.42}
    ],
    "herdsense_alert_date": "2026-07-03",
    "ndvi_breach_date": "2026-07-14",
    "lead_time_days": 11
}
```

---

### Get active alerts

```
GET /api/alerts
```

Get currently active stress alerts across all regions.

Response:
```json
{
    "alerts": [
        {
            "region": "Moyale Corridor",
            "center": {"lat": 3.5, "lng": 38.5},
            "severity": "high",
            "affected_herds": 5,
            "avg_score": 78,
            "triggered_at": "2026-07-29T12:00:00Z",
            "recommended_action": "Move herd toward water point within 3 days"
        }
    ]
}
```

Alert severity levels: `low` (score 35-50), `moderate` (score 50-65), `high` (score 65+)

---

## Error handling

All endpoints return errors in this format:

```json
{
    "error": "description of what went wrong",
    "code": "ERROR_CODE"
}
```

HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad request (missing or invalid fields)
- 404: Not found
- 500: Server error
