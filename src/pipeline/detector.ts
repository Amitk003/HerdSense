import type { BoundingBox, DetectionFrame } from './types'

const CONFIDENCE_THRESHOLD = 0.5
const FRAME_SAMPLE_RATE = 3

export class Detector {
  private session: any = null
  private modelLoaded = false

  async loadModel(modelPath: string): Promise<void> {
    try {
      const ort = await import('onnxruntime-web')
      this.session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['webgl', 'wasm']
      })
      this.modelLoaded = true
    } catch (err) {
      console.warn('ONNX model load failed, using preset mode:', err)
      this.modelLoaded = false
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
      video.currentTime = i / 30
      await this.waitForSeek(video)

      ctx.drawImage(video, 0, 0, 640, 640)
      const imageData = ctx.getImageData(0, 0, 640, 640)

      const inputTensor = this.preprocess(imageData)
      const results = await this.session.run({ images: inputTensor })
      const boxes = this.parseOutput(results, 640, 640)

      frames.push({
        frameIndex: i,
        boxes: boxes.filter(b => b.confidence >= CONFIDENCE_THRESHOLD)
      })
    }

    return frames
  }

  private preprocess(imageData: ImageData): any {
    const ort = (window as any).ort
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
    const output = results[Object.keys(results)[0]]
    const data = output.data
    const boxes: BoundingBox[] = []

    for (let i = 0; i < data.length; i += 6) {
      const x = data[i] * imgW
      const y = data[i + 1] * imgH
      const w = data[i + 2] * imgW
      const h = data[i + 3] * imgH
      const score = data[i + 4]
      const classId = data[i + 5]

      if (classId === 0 || classId === 17 || classId === 18) {
        boxes.push({
          x: x - w / 2,
          y: y - h / 2,
          width: w,
          height: h,
          confidence: score,
          animalId: -1
        })
      }
    }

    return boxes
  }

  private waitForSeek(video: HTMLVideoElement): Promise<void> {
    return new Promise(resolve => {
      const handler = () => {
        video.removeEventListener('seeked', handler)
        resolve()
      }
      video.addEventListener('seeked', handler)
    })
  }
}
