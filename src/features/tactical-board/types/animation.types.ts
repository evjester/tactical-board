// Animation types for the tactical board

export interface AnimationFrame {
  id: string
  index: number
  durationMs: number
  // State snapshots or deltas
  playerPositions: Record<
    string,
    {
      x: number
      y: number
      rotation?: number
      movementArrow?: {
        direction: number
        length: number
      } | null
    }
  >
  ballPosition?: {
    x: number
    y: number
  }
  // Equipment positions (cones, mannequins, poles, ladders, hurdles)
  equipmentPositions?: Record<
    string,
    {
      x: number
      y: number
      rotation?: number
    }
  >
  drawingChanges?: Record<
    string,
    {
      points?: number[]
      opacity?: number
      isVisible?: boolean
    }
  >
  // Optional: new drawings that appear in this frame
  newDrawings?: string[]
  // Optional: drawings that are removed in this frame
  removedDrawings?: string[]
}

export interface AnimationState {
  frames: AnimationFrame[]
  currentFrameIndex: number
  isPlaying: boolean
  isRecording: boolean
  playbackSpeed: number // 0.5, 1, 1.5, 2
  loop: boolean
}

export interface AnimationPlaybackOptions {
  speed: number
  loop: boolean
  onFrameChange?: (frameIndex: number) => void
  onComplete?: () => void
}

// Easing function type
export type EasingFunction = (t: number) => number

// Interpolation result
export interface InterpolatedPosition {
  x: number
  y: number
  rotation?: number
}

// Tween configuration
export interface TweenConfig {
  startValue: number
  endValue: number
  duration: number
  easing: EasingFunction
}
