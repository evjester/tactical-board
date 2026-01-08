import { useEffect, useRef, useCallback } from 'react'
import { useTacticalBoardStore } from '../store'
import {
  interpolatePlayerPositions,
  interpolateBallPosition,
  interpolateEquipmentPositions,
  getFrameAtTime,
  getTotalDuration,
  easings,
} from '../utils/interpolation'
import type { EasingFunction, AnimationFrame, Player, Ball, Equipment } from '../types'

interface UseAnimationOptions {
  easing?: EasingFunction
  onFrameChange?: (frameIndex: number) => void
  onComplete?: () => void
}

export function useAnimation(options: UseAnimationOptions = {}) {
  const { easing = easings.easeInOutQuad, onFrameChange, onComplete } = options

  // Get store state
  const animationState = useTacticalBoardStore((state) => state.animation)
  const players = useTacticalBoardStore((state) => state.players)
  const ball = useTacticalBoardStore((state) => state.ball)
  const equipment = useTacticalBoardStore((state) => state.equipment)

  // Get actions directly
  const goToFrame = useTacticalBoardStore((state) => state.goToFrame)
  const pauseAnimation = useTacticalBoardStore((state) => state.pauseAnimation)
  const updatePlayer = useTacticalBoardStore((state) => state.updatePlayer)
  const moveBall = useTacticalBoardStore((state) => state.moveBall)
  const moveEquipment = useTacticalBoardStore((state) => state.moveEquipment)

  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastFrameIndexRef = useRef<number>(0)

  // Use refs to avoid stale closures in animation loop
  const playersRef = useRef<Player[]>(players)
  const framesRef = useRef<AnimationFrame[]>(animationState.frames)
  const isPlayingRef = useRef(animationState.isPlaying)
  const playbackSpeedRef = useRef(animationState.playbackSpeed)
  const loopRef = useRef(animationState.loop)
  const ballRef = useRef<Ball | null>(ball)
  const equipmentRef = useRef<Equipment[]>(equipment)

  // Update refs when state changes
  useEffect(() => { playersRef.current = players }, [players])
  useEffect(() => { framesRef.current = animationState.frames }, [animationState.frames])
  useEffect(() => { isPlayingRef.current = animationState.isPlaying }, [animationState.isPlaying])
  useEffect(() => { playbackSpeedRef.current = animationState.playbackSpeed }, [animationState.playbackSpeed])
  useEffect(() => { loopRef.current = animationState.loop }, [animationState.loop])
  useEffect(() => { ballRef.current = ball }, [ball])
  useEffect(() => { equipmentRef.current = equipment }, [equipment])

  // Calculate total duration
  const totalDuration = getTotalDuration(animationState.frames)

  // Animation loop - uses refs to always have current values
  const animate = useCallback(
    (timestamp: number) => {
      const frames = framesRef.current
      const currentPlayers = playersRef.current
      const isPlaying = isPlayingRef.current
      const playbackSpeed = playbackSpeedRef.current
      const loop = loopRef.current
      const currentBall = ballRef.current
      const currentEquipment = equipmentRef.current

      if (!isPlaying || frames.length < 2) {
        return
      }

      // Initialize start time on first frame
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp
      }

      // Calculate elapsed time with speed multiplier
      const elapsed = (timestamp - startTimeRef.current) * playbackSpeed
      const duration = getTotalDuration(frames)

      // Get current frame and progress
      const { frameIndex, progress } = getFrameAtTime(frames, elapsed)

      // Notify on frame change
      if (frameIndex !== lastFrameIndexRef.current) {
        lastFrameIndexRef.current = frameIndex
        goToFrame(frameIndex)
        onFrameChange?.(frameIndex)
      }

      // If we're between frames, interpolate positions
      if (frameIndex < frames.length - 1) {
        const currentFrame = frames[frameIndex]
        const nextFrame = frames[frameIndex + 1]

        // Interpolate player positions
        const interpolatedPositions = interpolatePlayerPositions(
          currentPlayers,
          currentFrame,
          nextFrame,
          progress,
          easing
        )

        // Apply interpolated positions to players
        interpolatedPositions.forEach((pos, playerId) => {
          updatePlayer(playerId, {
            x: pos.x,
            y: pos.y,
            rotation: pos.rotation,
          })
        })

        // Interpolate ball position
        const ballPos = interpolateBallPosition(currentFrame, nextFrame, progress, easing)
        if (ballPos && currentBall) {
          moveBall(ballPos.x, ballPos.y)
        }

        // Interpolate equipment positions
        const interpolatedEquipment = interpolateEquipmentPositions(
          currentEquipment,
          currentFrame,
          nextFrame,
          progress,
          easing
        )

        // Apply interpolated positions to equipment
        interpolatedEquipment.forEach((pos, equipmentId) => {
          moveEquipment(equipmentId, pos.x, pos.y)
        })
      }

      // Check if animation is complete
      if (elapsed >= duration) {
        if (loop) {
          // Reset and continue
          startTimeRef.current = timestamp
          lastFrameIndexRef.current = 0
          goToFrame(0)

          // Apply first frame positions
          const firstFrame = frames[0]
          Object.entries(firstFrame.playerPositions).forEach(([playerId, pos]) => {
            updatePlayer(playerId, {
              x: pos.x,
              y: pos.y,
              rotation: pos.rotation,
            })
          })
          if (firstFrame.ballPosition && currentBall) {
            moveBall(firstFrame.ballPosition.x, firstFrame.ballPosition.y)
          }
          // Apply first frame equipment positions
          if (firstFrame.equipmentPositions) {
            Object.entries(firstFrame.equipmentPositions).forEach(([equipmentId, pos]) => {
              moveEquipment(equipmentId, pos.x, pos.y)
            })
          }
        } else {
          // Stop animation
          pauseAnimation()
          onComplete?.()
          return
        }
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    },
    [easing, goToFrame, pauseAnimation, updatePlayer, moveBall, moveEquipment, onFrameChange, onComplete]
  )

  // Helper to apply frame positions
  const applyFramePositions = useCallback((frameIndex: number) => {
    const frames = framesRef.current
    const currentBall = ballRef.current

    if (frameIndex < 0 || frameIndex >= frames.length) return

    const frame = frames[frameIndex]

    // Apply player positions
    Object.entries(frame.playerPositions).forEach(([playerId, pos]) => {
      updatePlayer(playerId, {
        x: pos.x,
        y: pos.y,
        rotation: pos.rotation,
      })
    })

    // Apply ball position
    if (frame.ballPosition && currentBall) {
      moveBall(frame.ballPosition.x, frame.ballPosition.y)
    }

    // Apply equipment positions
    if (frame.equipmentPositions) {
      Object.entries(frame.equipmentPositions).forEach(([equipmentId, pos]) => {
        moveEquipment(equipmentId, pos.x, pos.y)
      })
    }
  }, [updatePlayer, moveBall, moveEquipment])

  // Track previous playing state to detect when animation stops
  const wasPlayingRef = useRef(false)

  // Start/stop animation based on isPlaying state
  useEffect(() => {
    if (animationState.isPlaying && animationState.frames.length >= 2) {
      // Only reset start time when starting a new animation
      if (animationRef.current === null) {
        startTimeRef.current = 0
        lastFrameIndexRef.current = 0
      }
      animationRef.current = requestAnimationFrame(animate)
      wasPlayingRef.current = true
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }

      // When animation stops, snap to current frame positions
      // This prevents items from being left at interpolated positions
      if (wasPlayingRef.current && animationState.frames.length > 0) {
        applyFramePositions(animationState.currentFrameIndex)
      }
      wasPlayingRef.current = false
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    // Note: Don't include currentFrameIndex - it changes during playback and would reset the animation
  }, [animationState.isPlaying, animationState.frames.length, animationState.currentFrameIndex, animate, applyFramePositions])

  // Jump to a specific frame and apply positions
  const jumpToFrame = useCallback(
    (frameIndex: number) => {
      const frames = framesRef.current
      if (frameIndex < 0 || frameIndex >= frames.length) return

      goToFrame(frameIndex)
      applyFramePositions(frameIndex)
    },
    [goToFrame, applyFramePositions]
  )

  // Capture current state as a keyframe
  const captureKeyframe = useCallback(() => {
    const { addKeyframe } = useTacticalBoardStore.getState()
    addKeyframe()
  }, [])

  return {
    // State
    frames: animationState.frames,
    currentFrameIndex: animationState.currentFrameIndex,
    isPlaying: animationState.isPlaying,
    playbackSpeed: animationState.playbackSpeed,
    loop: animationState.loop,
    totalDuration,
    frameCount: animationState.frames.length,

    // Actions
    jumpToFrame,
    captureKeyframe,
  }
}
