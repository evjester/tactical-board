import Konva from 'konva'

export interface ExportOptions {
  pixelRatio?: number
  mimeType?: 'image/png' | 'image/jpeg'
  quality?: number
  backgroundColor?: string
}

/**
 * Export a Konva stage to a data URL
 */
export function stageToDataUrl(stage: Konva.Stage, options: ExportOptions = {}): string {
  const { pixelRatio = 2, mimeType = 'image/png', quality = 1 } = options

  return stage.toDataURL({
    pixelRatio,
    mimeType,
    quality,
  })
}

/**
 * Export a Konva stage to a Blob
 */
export function stageToBlob(stage: Konva.Stage, options: ExportOptions = {}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { pixelRatio = 2, mimeType = 'image/png', quality = 1 } = options

    try {
      stage.toBlob({
        callback: (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        pixelRatio,
        mimeType,
        quality,
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Download a Konva stage as PNG
 */
export async function downloadStageAsPng(
  stage: Konva.Stage,
  filename: string = 'tactic.png',
  options: ExportOptions = {}
): Promise<void> {
  try {
    const blob = await stageToBlob(stage, { ...options, mimeType: 'image/png' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download PNG:', error)
    throw error
  }
}

/**
 * Download a Konva stage as JPEG
 */
export async function downloadStageAsJpeg(
  stage: Konva.Stage,
  filename: string = 'tactic.jpg',
  options: ExportOptions = {}
): Promise<void> {
  try {
    const blob = await stageToBlob(stage, { ...options, mimeType: 'image/jpeg', quality: 0.9 })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download JPEG:', error)
    throw error
  }
}

/**
 * Copy stage image to clipboard
 */
export async function copyStageToClipboard(stage: Konva.Stage, options: ExportOptions = {}): Promise<void> {
  try {
    const blob = await stageToBlob(stage, { ...options, mimeType: 'image/png' })
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ])
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    throw error
  }
}
