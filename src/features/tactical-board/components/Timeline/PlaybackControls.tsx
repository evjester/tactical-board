import { useTacticalBoardStore, useAnimationState } from '../../store'

interface PlaybackControlsProps {
  onCaptureKeyframe: () => void
  frameCount: number
  currentFrameIndex: number
  totalDuration: number
}

export function PlaybackControls({
  onCaptureKeyframe,
  frameCount,
  currentFrameIndex,
  totalDuration,
}: PlaybackControlsProps) {
  const animationState = useAnimationState()
  const {
    playAnimation,
    pauseAnimation,
    goToFrame,
    setPlaybackSpeed,
    toggleLoop,
    clearAnimation,
  } = useTacticalBoardStore()

  const handlePlayPause = () => {
    if (animationState.isPlaying) {
      pauseAnimation()
    } else {
      playAnimation()
    }
  }

  const handlePrevFrame = () => {
    if (currentFrameIndex > 0) {
      goToFrame(currentFrameIndex - 1)
    }
  }

  const handleNextFrame = () => {
    if (currentFrameIndex < frameCount - 1) {
      goToFrame(currentFrameIndex + 1)
    }
  }

  const handleFirstFrame = () => {
    goToFrame(0)
  }

  const handleLastFrame = () => {
    if (frameCount > 0) {
      goToFrame(frameCount - 1)
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const speedOptions = [0.25, 0.5, 1, 1.5, 2]

  return (
    <div className="flex items-center gap-4">
      {/* Frame Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleFirstFrame}
          disabled={frameCount === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First frame"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="11,19 2,12 11,5" />
            <line x1="22" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        <button
          onClick={handlePrevFrame}
          disabled={currentFrameIndex === 0 || frameCount === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous frame"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19,20 9,12 19,4" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>

        <button
          onClick={handlePlayPause}
          disabled={frameCount < 2}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            animationState.isPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          title={animationState.isPlaying ? 'Pause' : 'Play'}
        >
          {animationState.isPlaying ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <button
          onClick={handleNextFrame}
          disabled={currentFrameIndex >= frameCount - 1 || frameCount === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next frame"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5,4 15,12 5,20" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>

        <button
          onClick={handleLastFrame}
          disabled={frameCount === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last frame"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="13,5 22,12 13,19" />
            <line x1="2" y1="12" x2="15" y2="12" />
          </svg>
        </button>
      </div>

      {/* Frame Counter */}
      <div className="text-sm text-gray-600 min-w-[80px]">
        Frame: {frameCount > 0 ? currentFrameIndex + 1 : 0} / {frameCount}
      </div>

      {/* Duration */}
      <div className="text-sm text-gray-500">
        {formatDuration(totalDuration)}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Add Keyframe */}
      <button
        onClick={onCaptureKeyframe}
        className="px-3 py-1.5 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
        title="Capture current positions as keyframe"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Keyframe
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Playback Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Speed:</span>
        <select
          value={animationState.playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {speedOptions.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>

      {/* Loop Toggle */}
      <button
        onClick={toggleLoop}
        className={`p-2 rounded-lg transition-colors ${
          animationState.loop
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={animationState.loop ? 'Loop enabled' : 'Loop disabled'}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="17,1 21,5 17,9" />
          <path d="M3,11 V9 A4,4 0 0,1 7,5 H21" />
          <polyline points="7,23 3,19 7,15" />
          <path d="M21,13 V15 A4,4 0 0,1 17,19 H3" />
        </svg>
      </button>

      {/* Clear Animation */}
      {frameCount > 0 && (
        <button
          onClick={() => {
            if (confirm('Clear all keyframes?')) {
              clearAnimation()
            }
          }}
          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          title="Clear all keyframes"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19,6 V20 A2,2 0 0,1 17,22 H7 A2,2 0 0,1 5,20 V6 M8,6 V4 A2,2 0 0,1 10,2 H14 A2,2 0 0,1 16,4 V6" />
          </svg>
        </button>
      )}
    </div>
  )
}
