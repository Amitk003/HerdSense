const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export function encodeGeoHash(lat: number, lng: number, precision = 3): string {
  let hash = ''
  let minLat = -90, maxLat = 90
  let minLng = -180, maxLng = 180
  let bit = 0
  let ch = 0
  let isLng = true

  while (hash.length < precision) {
    if (isLng) {
      const mid = (minLng + maxLng) / 2
      if (lng > mid) {
        ch |= (1 << (4 - bit))
        minLng = mid
      } else {
        maxLng = mid
      }
    } else {
      const mid = (minLat + maxLat) / 2
      if (lat > mid) {
        ch |= (1 << (4 - bit))
        minLat = mid
      } else {
        maxLat = mid
      }
    }

    isLng = !isLng
    bit++

    if (bit > 4) {
      hash += BASE32[ch]
      bit = 0
      ch = 0
    }
  }

  return hash
}


