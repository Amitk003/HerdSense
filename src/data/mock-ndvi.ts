import type { NdviReading } from '../pipeline/types'

const NDVI_THRESHOLD = 0.30

export interface NdviTimeline {
  readings: NdviReading[]
  alertDate: string
  breachDate: string
  leadTimeDays: number
}

export function getNdviTimeline(herdsenseAlertDay: number): NdviTimeline {
  const readings: NdviReading[] = []
  const startDate = new Date('2026-07-01')

  for (let day = 0; day < 30; day++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + day)

    let ndvi = 0.50 - (day * 0.015) + (Math.random() - 0.5) * 0.03
    ndvi = Math.max(0.10, Math.min(0.60, ndvi))

    readings.push({
      date: date.toISOString().split('T')[0],
      ndvi: Math.round(ndvi * 100) / 100
    })
  }

  let breachDate = ''
  for (const r of readings) {
    if (r.ndvi < NDVI_THRESHOLD) {
      breachDate = r.date
      break
    }
  }

  const alertDate = new Date(startDate)
  alertDate.setDate(alertDate.getDate() + herdsenseAlertDay)
  const alertDateStr = alertDate.toISOString().split('T')[0]

  const breachDay = breachDate
    ? (new Date(breachDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    : 30

  const leadTimeDays = breachDate
    ? Math.round(breachDay - herdsenseAlertDay)
    : 0

  return {
    readings,
    alertDate: alertDateStr,
    breachDate,
    leadTimeDays
  }
}
