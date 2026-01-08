// GIF Export functionality for animations
import type Konva from 'konva'
import type { AnimationFrame } from '../types'
import { interpolatePlayerPositions, easings } from './interpolation'
import type { Player } from '../types'

// GIF.js will be loaded dynamically
declare global {
  interface Window {
    GIF: any
  }
}

export interface GifExportOptions {
  width?: number
  height?: number
  quality?: number // 1-30, lower is better quality
  fps?: number
  loop?: boolean
}

export interface GifExportProgress {
  phase: 'rendering' | 'encoding' | 'complete'
  progress: number // 0-100
  currentFrame?: number
  totalFrames?: number
}

// Load GIF.js worker script dynamically
async function loadGifJs(): Promise<any> {
  if (window.GIF) {
    return window.GIF
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js'
    script.onload = () => {
      if (window.GIF) {
        resolve(window.GIF)
      } else {
        reject(new Error('GIF.js failed to load'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load GIF.js'))
    document.head.appendChild(script)
  })
}

// Export animation as GIF
export async function exportAnimationAsGif(
  stage: Konva.Stage,
  frames: AnimationFrame[],
  players: Player[],
  options: GifExportOptions = {},
  onProgress?: (progress: GifExportProgress) => void
): Promise<Blob> {
  const {
    width = stage.width(),
    height = stage.height(),
    quality = 10,
    fps = 15,
    loop = true,
  } = options

  if (frames.length < 2) {
    throw new Error('At least 2 keyframes required for GIF export')
  }

  // Load GIF.js
  const GIF = await loadGifJs()

  return new Promise((resolve) => {
    const gif = new GIF({
      workers: 2,
      quality,
      width,
      height,
      repeat: loop ? 0 : -1, // 0 = loop forever, -1 = no loop
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
    })

    // Calculate total frames needed
    const frameDuration = 1000 / fps
    const totalDuration = frames.reduce((sum, f) => sum + f.durationMs, 0)
    const totalGifFrames = Math.ceil(totalDuration / frameDuration)

    let currentTime = 0
    let renderedFrames = 0

    // Render each interpolated frame
    const renderNextFrame = () => {
      if (currentTime >= totalDuration) {
        // All frames rendered, finish encoding
        onProgress?.({
          phase: 'encoding',
          progress: 0,
        })

        gif.on('progress', (p: number) => {
          onProgress?.({
            phase: 'encoding',
            progress: Math.round(p * 100),
          })
        })

        gif.on('finished', (blob: Blob) => {
          onProgress?.({
            phase: 'complete',
            progress: 100,
          })
          resolve(blob)
        })

        gif.render()
        return
      }

      // Find current keyframe and progress
      let accumulatedTime = 0
      let frameIndex = 0
      for (let i = 0; i < frames.length; i++) {
        if (currentTime < accumulatedTime + frames[i].durationMs) {
          frameIndex = i
          break
        }
        accumulatedTime += frames[i].durationMs
        frameIndex = i
      }

      const currentFrame = frames[frameIndex]
      const nextFrame = frames[frameIndex + 1] || frames[frameIndex]
      const frameProgress = frameIndex < frames.length - 1
        ? (currentTime - accumulatedTime) / currentFrame.durationMs
        : 1

      // Interpolate positions (used for future enhanced export)
      interpolatePlayerPositions(
        players,
        currentFrame,
        nextFrame,
        frameProgress,
        easings.easeInOutQuad
      )

      // Capture current stage state
      const canvas = stage.toCanvas({ pixelRatio: 1 })

      // Add frame to GIF
      gif.addFrame(canvas, {
        delay: frameDuration,
        copy: true,
      })

      renderedFrames++
      currentTime += frameDuration

      onProgress?.({
        phase: 'rendering',
        progress: Math.round((renderedFrames / totalGifFrames) * 100),
        currentFrame: renderedFrames,
        totalFrames: totalGifFrames,
      })

      // Use setTimeout to prevent blocking
      setTimeout(renderNextFrame, 0)
    }

    renderNextFrame()
  })
}

// Alternative: Export using canvas recording (simpler approach)
export async function exportAnimationAsGifSimple(
  stage: Konva.Stage,
  frames: AnimationFrame[],
  options: GifExportOptions = {},
  onProgress?: (progress: GifExportProgress) => void
): Promise<Blob> {
  const {
    width = stage.width(),
    height = stage.height(),
    quality = 10,
    loop = true,
  } = options

  if (frames.length < 1) {
    throw new Error('At least 1 keyframe required for GIF export')
  }

  const GIF = await loadGifJs()

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality,
      width,
      height,
      repeat: loop ? 0 : -1,
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
    })

    // Add each keyframe as a GIF frame
    frames.forEach((frame, index) => {
      const canvas = stage.toCanvas({ pixelRatio: 1 })
      gif.addFrame(canvas, {
        delay: frame.durationMs,
        copy: true,
      })

      onProgress?.({
        phase: 'rendering',
        progress: Math.round(((index + 1) / frames.length) * 100),
        currentFrame: index + 1,
        totalFrames: frames.length,
      })
    })

    gif.on('progress', (p: number) => {
      onProgress?.({
        phase: 'encoding',
        progress: Math.round(p * 100),
      })
    })

    gif.on('finished', (blob: Blob) => {
      onProgress?.({
        phase: 'complete',
        progress: 100,
      })
      resolve(blob)
    })

    gif.on('error', reject)
    gif.render()
  })
}

// Download GIF blob
export function downloadGif(blob: Blob, filename: string = 'animation.gif'): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
