import type { DemoPreset } from '../pipeline/types'

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'healthy',
    label: 'Healthy Herd',
    description: 'Herd is spread out, grazing normally. Low stress.',
    videoFile: '/videos/healthy.mp4',
    precomputedScore: 22,
    precomputedSubscores: {
      clustering: 0.15,
      motion: 0.20,
      posture: 0.18,
      audio: 0.10
    }
  },
  {
    id: 'early-stress',
    label: 'Early Stress',
    description: 'Animals are bunching together and moving restlessly.',
    videoFile: '/videos/early-stress.mp4',
    precomputedScore: 58,
    precomputedSubscores: {
      clustering: 0.55,
      motion: 0.60,
      posture: 0.45,
      audio: 0.50
    }
  },
  {
    id: 'critical',
    label: 'Critical Distress',
    description: 'Herd is clustered, heads drooping, minimal movement.',
    videoFile: '/videos/critical.mp4',
    precomputedScore: 84,
    precomputedSubscores: {
      clustering: 0.85,
      motion: 0.70,
      posture: 0.80,
      audio: 0.80
    }
  }
]
