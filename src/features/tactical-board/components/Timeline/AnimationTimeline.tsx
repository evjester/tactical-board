import { useState, useRef } from 'react'
import { useTacticalBoardStore, useAnimationState } from '../../store'
import { PlaybackControls } from './PlaybackControls'
import { useAnimation } from '../../hooks'
import type { AnimationFrame } from '../../types'

export function AnimationTimeline() {
  const animationState = useAnimationState()
  const { removeKeyframe } = useTacticalBoardStore()
  const { captureKeyframe, jumpToFrame, totalDuration, frameCount, currentFrameIndex } = useAnimation()

  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  const [editingDuration, setEditingDuration] = useState<string | null>(null)
  const [durationValue, setDurationValue] = useState('')

  const timelineRef = useRef<HTMLDivElement>(null)

  const handleFrameClick = (frame: AnimationFrame, index: number) => {
    setSelectedFrameId(frame.id)
    jumpToFrame(index)
  }

  const handleFrameDelete = (index: number) => {
    if (confirm('Delete this keyframe?')) {
      removeKeyframe(index)
      setSelectedFrameId(null)
    }
  }

  const handleDurationEdit = (frameId: string, currentDuration: number) => {
    setEditingDuration(frameId)
    setDurationValue(String(currentDuration))
  }

  const handleDurationSave = (frameIndex: number) => {
    const newDuration = parseInt(durationValue, 10)
    if (!isNaN(newDuration) && newDuration > 0) {
      // Update frame duration in store
      const { animation, ...rest } = useTacticalBoardStore.getState()
      const updatedFrames = [...animation.frames]
      if (updatedFrames[frameIndex]) {
        updatedFrames[frameIndex] = { ...updatedFrames[frameIndex], durationMs: newDuration }
        useTacticalBoardStore.setState({
          ...rest,
          animation: { ...animation, frames: updatedFrames },
        })
      }
    }
    setEditingDuration(null)
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  // Calculate accumulated time for each frame
  const frameTimings = animationState.frames.reduce<number[]>((acc, _frame, i) => {
    const prevTime = i > 0 ? acc[i - 1] + animationState.frames[i - 1].durationMs : 0
    acc.push(prevTime)
    return acc
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header with playback controls */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <PlaybackControls
          onCaptureKeyframe={captureKeyframe}
          frameCount={frameCount}
          currentFrameIndex={currentFrameIndex}
          totalDuration={totalDuration}
        />
      </div>

      {/* Timeline track */}
      <div className="p-4">
        {animationState.frames.length === 0 ? (
          <div className="h-24 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No keyframes yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Position players and equipment, then click "Add Keyframe" to start animating
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Timeline ruler */}
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 px-2">
              <span>0s</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <span>{formatTime(totalDuration)}</span>
            </div>

            {/* Frame track */}
            <div
              ref={timelineRef}
              className="relative flex items-stretch gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[80px] overflow-x-auto"
            >
              {animationState.frames.map((frame, index) => {
                const isSelected = selectedFrameId === frame.id
                const isCurrent = index === currentFrameIndex
                const playerCount = Object.keys(frame.playerPositions).length
                const equipmentCount = Object.keys(frame.equipmentPositions || {}).length

                return (
                  <div
                    key={frame.id}
                    onClick={() => handleFrameClick(frame, index)}
                    className={`
                      relative flex-shrink-0 w-24 p-2 rounded-lg cursor-pointer transition-all
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}
                      border hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm
                    `}
                  >
                    {/* Frame number badge */}
                    <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium ${isCurrent ? 'bg-blue-600' : 'bg-gray-700 dark:bg-gray-500'}`}>
                      {index + 1}
                    </div>

                    {/* Frame content */}
                    <div className="text-center">
                      {/* Time marker */}
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                        {formatTime(frameTimings[index])}
                      </div>

                      {/* Player and equipment counts */}
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {/* Player count */}
                        <div className="flex items-center gap-0.5" title="Players">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 text-gray-500 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="7" r="4" />
                            <path d="M5.5,21 v-2 a6.5,6.5 0 0,1 13,0 v2" />
                          </svg>
                          <span className="text-xs text-gray-600 dark:text-gray-300">{playerCount}</span>
                        </div>
                        {/* Equipment count (only show if > 0) */}
                        {equipmentCount > 0 && (
                          <div className="flex items-center gap-0.5" title="Equipment">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-3 h-3 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polygon points="12,4 20,20 4,20" fill="#f97316" fillOpacity="0.8" stroke="#c2410c" />
                            </svg>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{equipmentCount}</span>
                          </div>
                        )}
                      </div>

                      {/* Duration editor */}
                      {editingDuration === frame.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={durationValue}
                            onChange={(e) => setDurationValue(e.target.value)}
                            onBlur={() => handleDurationSave(index)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDurationSave(index)}
                            className="w-14 text-xs px-1 py-0.5 border rounded text-center dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            autoFocus
                            min={100}
                            step={100}
                          />
                          <span className="text-[10px] text-gray-400">ms</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDurationEdit(frame.id, frame.durationMs)
                          }}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                        >
                          {formatTime(frame.durationMs)}
                        </button>
                      )}

                      {/* Ball indicator */}
                      {frame.ballPosition && (
                        <div className="mt-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" title="Has ball" />
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFrameDelete(index)
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="Delete keyframe"
                      >
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}

              {/* Add frame button at end */}
              <button
                onClick={captureKeyframe}
                className="flex-shrink-0 w-16 p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center justify-center"
                title="Add keyframe"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-[10px] mt-1">Add</span>
              </button>
            </div>

            {/* Progress bar */}
            {animationState.isPlaying && totalDuration > 0 && (
              <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{
                    width: `${((frameTimings[currentFrameIndex] || 0) / totalDuration) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Instructions */}
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Click a keyframe to jump to it • Click duration to edit • Drag players/equipment to update positions
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
