import type { EasingFunction, InterpolatedPosition, AnimationFrame } from '../types'
import type { Player, Equipment } from '../types'

// Common easing functions
export const easings = {
  // Linear - constant speed
  linear: (t: number): number => t,

  // Ease in - starts slow
  easeInQuad: (t: number): number => t * t,
  easeInCubic: (t: number): number => t * t * t,
  easeInQuart: (t: number): number => t * t * t * t,

  // Ease out - ends slow
  easeOutQuad: (t: number): number => t * (2 - t),
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),

  // Ease in out - slow at both ends
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInOutQuart: (t: number): number =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,

  // Bounce effect
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },

  // Elastic effect
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
} as const

// Default easing for animations
export const defaultEasing: EasingFunction = easings.easeInOutQuad

/**
 * Interpolate a single value between start and end
 */
export function lerp(start: number, end: number, t: number, easing: EasingFunction = defaultEasing): number {
  const easedT = easing(Math.max(0, Math.min(1, t)))
  return start + (end - start) * easedT
}

/**
 * Interpolate a position (x, y, rotation)
 */
export function interpolatePosition(
  start: InterpolatedPosition,
  end: InterpolatedPosition,
  t: number,
  easing: EasingFunction = defaultEasing
): InterpolatedPosition {
  return {
    x: lerp(start.x, end.x, t, easing),
    y: lerp(start.y, end.y, t, easing),
    rotation: start.rotation !== undefined && end.rotation !== undefined
      ? lerp(start.rotation, end.rotation, t, easing)
      : undefined,
  }
}

/**
 * Interpolate all player positions between two frames
 */
export function interpolatePlayerPositions(
  players: Player[],
  startFrame: AnimationFrame,
  endFrame: AnimationFrame,
  t: number,
  easing: EasingFunction = defaultEasing
): Map<string, InterpolatedPosition> {
  const result = new Map<string, InterpolatedPosition>()

  for (const player of players) {
    const startPos = startFrame.playerPositions[player.id]
    const endPos = endFrame.playerPositions[player.id]

    if (startPos && endPos) {
      result.set(player.id, interpolatePosition(
        { x: startPos.x, y: startPos.y, rotation: startPos.rotation },
        { x: endPos.x, y: endPos.y, rotation: endPos.rotation },
        t,
        easing
      ))
    } else if (startPos) {
      // Player exists in start but not end - keep at start position
      result.set(player.id, { x: startPos.x, y: startPos.y, rotation: startPos.rotation })
    } else if (endPos) {
      // Player exists in end but not start - jump to end position
      result.set(player.id, { x: endPos.x, y: endPos.y, rotation: endPos.rotation })
    }
  }

  return result
}

/**
 * Interpolate ball position between two frames
 */
export function interpolateBallPosition(
  startFrame: AnimationFrame,
  endFrame: AnimationFrame,
  t: number,
  easing: EasingFunction = defaultEasing
): { x: number; y: number } | null {
  const startPos = startFrame.ballPosition
  const endPos = endFrame.ballPosition

  if (startPos && endPos) {
    return {
      x: lerp(startPos.x, endPos.x, t, easing),
      y: lerp(startPos.y, endPos.y, t, easing),
    }
  }

  // Return the position that exists, or null
  return endPos ?? startPos ?? null
}

/**
 * Interpolate all equipment positions between two frames
 */
export function interpolateEquipmentPositions(
  equipment: Equipment[],
  startFrame: AnimationFrame,
  endFrame: AnimationFrame,
  t: number,
  easing: EasingFunction = defaultEasing
): Map<string, InterpolatedPosition> {
  const result = new Map<string, InterpolatedPosition>()

  for (const item of equipment) {
    const startPos = startFrame.equipmentPositions?.[item.id]
    const endPos = endFrame.equipmentPositions?.[item.id]

    if (startPos && endPos) {
      result.set(item.id, interpolatePosition(
        { x: startPos.x, y: startPos.y, rotation: startPos.rotation },
        { x: endPos.x, y: endPos.y, rotation: endPos.rotation },
        t,
        easing
      ))
    } else if (startPos) {
      // Equipment exists in start but not end - keep at start position
      result.set(item.id, { x: startPos.x, y: startPos.y, rotation: startPos.rotation })
    } else if (endPos) {
      // Equipment exists in end but not start - jump to end position
      result.set(item.id, { x: endPos.x, y: endPos.y, rotation: endPos.rotation })
    }
  }

  return result
}

/**
 * Calculate the current animation progress
 */
export function calculateAnimationProgress(
  frames: AnimationFrame[],
  currentFrameIndex: number,
  elapsedTimeMs: number
): { frameIndex: number; frameProgress: number; isComplete: boolean } {
  if (frames.length === 0) {
    return { frameIndex: 0, frameProgress: 0, isComplete: true }
  }

  let totalTime = 0
  for (let i = 0; i <= currentFrameIndex && i < frames.length; i++) {
    totalTime += frames[i].durationMs
  }

  const currentFrameDuration = frames[currentFrameIndex]?.durationMs ?? 1000
  const frameStartTime = totalTime - currentFrameDuration
  const frameElapsed = elapsedTimeMs - frameStartTime

  const frameProgress = Math.min(1, Math.max(0, frameElapsed / currentFrameDuration))
  const isComplete = currentFrameIndex >= frames.length - 1 && frameProgress >= 1

  return { frameIndex: currentFrameIndex, frameProgress, isComplete }
}

/**
 * Get total animation duration in milliseconds
 */
export function getTotalDuration(frames: AnimationFrame[]): number {
  return frames.reduce((total, frame) => total + frame.durationMs, 0)
}

/**
 * Find the frame index and progress for a given time
 */
export function getFrameAtTime(
  frames: AnimationFrame[],
  timeMs: number
): { frameIndex: number; progress: number } {
  if (frames.length === 0) {
    return { frameIndex: 0, progress: 0 }
  }

  let accumulatedTime = 0
  for (let i = 0; i < frames.length; i++) {
    const frameDuration = frames[i].durationMs
    if (timeMs < accumulatedTime + frameDuration) {
      const progress = (timeMs - accumulatedTime) / frameDuration
      return { frameIndex: i, progress: Math.max(0, Math.min(1, progress)) }
    }
    accumulatedTime += frameDuration
  }

  // Past the end - return last frame at 100%
  return { frameIndex: frames.length - 1, progress: 1 }
}

/**
 * Apply interpolated positions to create ghost players for animation preview
 */
export function createGhostPlayers(
  players: Player[],
  positions: Map<string, InterpolatedPosition>
): Player[] {
  return players.map((player) => {
    const interpolatedPos = positions.get(player.id)
    if (interpolatedPos) {
      return {
        ...player,
        x: interpolatedPos.x,
        y: interpolatedPos.y,
        rotation: interpolatedPos.rotation ?? player.rotation,
        isGhost: true,
        opacity: 0.6,
      }
    }
    return { ...player, isGhost: true, opacity: 0.6 }
  })
}
