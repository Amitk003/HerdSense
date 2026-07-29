export interface NdviTimeline {
  alertDay: number
  breachDay: number
  leadTimeDays: number
}

export function getNdviTimeline(): NdviTimeline {
  const alertDay = 3
  const breachDay = 14
  return {
    alertDay,
    breachDay,
    leadTimeDays: breachDay - alertDay
  }
}
