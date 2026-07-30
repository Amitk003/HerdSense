import type { BoundingBox, DetectionFrame } from './types'
import { CONFIDENCE_THRESHOLD, FRAME_SAMPLE_RATE, FPS } from '../constants'

export class Detector {
  private session: any = null
  private modelLoaded = false
  private modelError = ''

  async loadModel(modelPath: string): Promise<void> {
    try {
      const ort = await import('onnxruntime-web')
      ort.env.wasm.wasmPaths = '/wasm/'
      this.session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['webgl', 'wasm']
      })
      this.modelLoaded = true
      this.modelError = ''
    } catch (err) {
      this.modelError = err instanceof Error ? err.message : String(err)
      throw new Error(`Model failed to load: ${this.modelError}`)
    }
  }

  get isLoaded(): boolean {
      return this.modelLoaded
  }

  async detectFrames(
    video: HTMLVideoElement,
    totalFrames: number
  ): Promise<DetectionFrame[]> {
    if (!this.modelLoaded) {
      return []
    }

    const frames: DetectionFrame[] = []
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = 640
    canvas.height = 640

    for (let i = 0; i < totalFrames; i += FRAME_SAMPLE_RATE) {
      const targetTime = i / FPS
      video.currentTime = targetTime
      await this.waitForSeek(video, targetTime)

      ctx.drawImage(video, 0, 0, 640, 640)
      const imageData = ctx.getImageData(0, 0, 640, 640)

      const inputTensor = await this.preprocess(imageData)
      const results = await this.session.run({ images: inputTensor })
      const boxes = this.parseOutput(results, 640, 640)

      frames.push({
        frameIndex: i,
        boxes: boxes.filter(b => b.confidence >= CONFIDENCE_THRESHOLD)
      })
    }

    const totalDetections = frames.reduce((s, f) => s + f.boxes.length, 0)
    console.log('[HerdSense] detectFrames:', frames.length, 'frames,', totalDetections, 'total detections after threshold')
    return frames
  }

  private async preprocess(imageData: ImageData): Promise<any> {
    const ort = await import('onnxruntime-web')
    const pixels = new Float32Array(640 * 640 * 3)
    let idx = 0
    for (let i = 0; i < imageData.data.length; i += 4) {
      pixels[idx++] = imageData.data[i] / 255.0
      pixels[idx++] = imageData.data[i + 1] / 255.0
      pixels[idx++] = imageData.data[i + 2] / 255.0
    }
    return new ort.Tensor('float32', pixels, [1, 3, 640, 640])
  }

  private parseOutput(results: any, imgW: number, imgH: number): BoundingBox[] {
    const keys = Object.keys(results)
    if (keys.length === 0) return []
    const output = results[keys[0]]
    const data: Float32Array = output.data
    const dims: number[] = output.dims || []
    const boxes: BoundingBox[] = []
    const validClassIds = new Set([19, 20, 21, 22, 23, 24])

    console.log('[HerdSense] Model output dims:', dims, 'data length:', data.length)

    if (dims.length === 3) {
      const [, d1, d2] = dims
      // [1, C, N] e.g. [1, 84, 8400]
      if (d1 < d2 && d1 >= 6) {
        const C = d1
        const N = d2
        for (let j = 0; j < N; j++) {
          let cx = data[0 * N + j]
          let cy = data[1 * N + j]
          let w = data[2 * N + j]
          let h = data[3 * N + j]

          if (cx > 1 || cy > 1 || w > 1 || h > 1) {
            cx /= 640
            cy /= 640
            w /= 640
            h /= 640
          }

          let maxScore = 0
          let bestClass = -1

          if (C === 6) {
            maxScore = data[4 * N + j]
            bestClass = Math.round(data[5 * N + j])
          } else {
            for (let c = 4; c < C; c++) {
              const score = data[c * N + j]
              const classId = c - 4
              if (validClassIds.has(classId) && score > maxScore) {
                maxScore = score
                bestClass = classId
              }
            }
          }

          if (validClassIds.has(bestClass) && maxScore >= CONFIDENCE_THRESHOLD) {
            const boxW = w * imgW
            const boxH = h * imgH
            const boxX = (cx * imgW) - boxW / 2
            const boxY = (cy * imgH) - boxH / 2

            boxes.push({
              x: boxX,
              y: boxY,
              width: boxW,
              height: boxH,
              confidence: maxScore,
              classId: bestClass,
              animalId: -1
            })
          }
        }
        return boxes
      }

      // [1, N, C] e.g. [1, 8400, 84]
      if (d1 >= d2 && d2 >= 6) {
        const N = d1
        const C = d2
        for (let j = 0; j < N; j++) {
          const offset = j * C
          let cx = data[offset]
          let cy = data[offset + 1]
          let w = data[offset + 2]
          let h = data[offset + 3]

          if (cx > 1 || cy > 1 || w > 1 || h > 1) {
            cx /= 640
            cy /= 640
            w /= 640
            h /= 640
          }

          let maxScore = 0
          let bestClass = -1

          if (C === 6) {
            maxScore = data[offset + 4]
            bestClass = Math.round(data[offset + 5])
          } else {
            for (let c = 4; c < C; c++) {
              const score = data[offset + c]
              const classId = c - 4
              if (validClassIds.has(classId) && score > maxScore) {
                maxScore = score
                bestClass = classId
              }
            }
          }

          if (validClassIds.has(bestClass) && maxScore >= CONFIDENCE_THRESHOLD) {
            const boxW = w * imgW
            const boxH = h * imgH
            const boxX = (cx * imgW) - boxW / 2
            const boxY = (cy * imgH) - boxH / 2

            boxes.push({
              x: boxX,
              y: boxY,
              width: boxW,
              height: boxH,
              confidence: maxScore,
              classId: bestClass,
              animalId: -1
            })
          }
        }
        return boxes
      }
    }

    // Fallback NMS array step by 6
    for (let i = 0; i < data.length; i += 6) {
      let x = data[i]
      let y = data[i + 1]
      let w = data[i + 2]
      let h = data[i + 3]
      const score = data[i + 4]
      const classId = Math.round(data[i + 5])

      if (x <= 1 && y <= 1 && w <= 1 && h <= 1) {
        x *= imgW
        y *= imgH
        w *= imgW
        h *= imgH
      }

      if (validClassIds.has(classId)) {
        boxes.push({
          x: x - w / 2,
          y: y - h / 2,
          width: w,
          height: h,
          confidence: score,
          classId,
          animalId: -1
        })
      }
    }

    console.log('[HerdSense] parseOutput found', boxes.length, 'animal detections')
    return boxes
  }

  private waitForSeek(video: HTMLVideoElement, targetTime: number): Promise<void> {
    return new Promise(resolve => {
      if (Math.abs(video.currentTime - targetTime) < 0.01 && video.readyState >= 2) {
        resolve()
        return
      }

      let timeout: ReturnType<typeof setTimeout>
      const handler = () => {
        clearTimeout(timeout)
        video.removeEventListener('seeked', handler)
        resolve()
      }
      video.addEventListener('seeked', handler)
      timeout = setTimeout(() => {
        video.removeEventListener('seeked', handler)
        resolve()
      }, 300)
    })
  }
}