// Export Animation Dialog - Export animation as GIF
import { useState } from 'react'
import type Konva from 'konva'
import { useAnimationState, usePlayers, useBall } from '../../store'
import { exportAnimationAsGifSimple, downloadGif, type GifExportProgress } from '../../utils/gifExport'

interface ExportAnimationDialogProps {
  isOpen: boolean
  onClose: () => void
  stageRef: React.RefObject<Konva.Stage | null>
}

export function ExportAnimationDialog({ isOpen, onClose, stageRef }: ExportAnimationDialogProps) {
  const animationState = useAnimationState()
  const players = usePlayers()
  const ball = useBall()

  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<GifExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    quality: 10,
    fps: 10,
    loop: true,
  })

  const handleExport = async () => {
    if (!stageRef.current || animationState.frames.length < 1) {
      setError('No animation frames to export')
      return
    }

    setIsExporting(true)
    setError(null)
    setProgress({ phase: 'rendering', progress: 0 })

    try {
      const blob = await exportAnimationAsGifSimple(
        stageRef.current,
        animationState.frames,
        {
          quality: settings.quality,
          fps: settings.fps,
          loop: settings.loop,
        },
        setProgress
      )

      downloadGif(blob, `tactical-animation-${Date.now()}.gif`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export GIF')
    } finally {
      setIsExporting(false)
      setProgress(null)
    }
  }

  if (!isOpen) return null

  const hasFrames = animationState.frames.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Export Animation</h2>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!hasFrames ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No animation frames</p>
            <p className="text-sm text-gray-400">Create keyframes in the timeline to export an animation.</p>
          </div>
        ) : (
          <>
            {/* Preview info */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Frames:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {animationState.frames.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {(animationState.frames.reduce((sum, f) => sum + f.durationMs, 0) / 1000).toFixed(1)}s
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Players:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {players.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Ball:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-white">
                    {ball ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quality (1-30, lower is better)
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.quality}
                  onChange={(e) => setSettings((s) => ({ ...s, quality: parseInt(e.target.value) }))}
                  className="w-full"
                  disabled={isExporting}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Best</span>
                  <span>{settings.quality}</span>
                  <span>Smallest</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frame Rate (FPS)
                </label>
                <select
                  value={settings.fps}
                  onChange={(e) => setSettings((s) => ({ ...s, fps: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  disabled={isExporting}
                >
                  <option value="5">5 FPS (Smooth)</option>
                  <option value="10">10 FPS (Default)</option>
                  <option value="15">15 FPS (High)</option>
                  <option value="24">24 FPS (Film)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="loop"
                  checked={settings.loop}
                  onChange={(e) => setSettings((s) => ({ ...s, loop: e.target.checked }))}
                  className="mr-2"
                  disabled={isExporting}
                />
                <label htmlFor="loop" className="text-sm text-gray-700 dark:text-gray-300">
                  Loop animation
                </label>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Progress */}
            {isExporting && progress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{progress.phase === 'rendering' ? 'Capturing frames...' : 'Encoding GIF...'}</span>
                  <span>{progress.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Export GIF
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
