// Speed curves - per-player easing configurations for animations
import type { EasingFunction } from '../types'
import { easings } from './interpolation'

export type SpeedCurveType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'sprint' // Fast start, slow end (for burst of speed)
  | 'decelerate' // Slow start, fast middle, slow end (natural running)
  | 'explosive' // Very fast start (for quick movements)
  | 'cautious' // Slow approach (for defensive positioning)

export interface PlayerSpeedCurve {
  playerId: string
  curveType: SpeedCurveType
  customCurve?: EasingFunction
}

// Preset speed curves
export const SPEED_CURVES: Record<SpeedCurveType, { name: string; description: string; easing: EasingFunction }> = {
  linear: {
    name: 'Linear',
    description: 'Constant speed throughout',
    easing: easings.linear,
  },
  easeIn: {
    name: 'Ease In',
    description: 'Starts slow, accelerates',
    easing: easings.easeInQuad,
  },
  easeOut: {
    name: 'Ease Out',
    description: 'Starts fast, decelerates',
    easing: easings.easeOutQuad,
  },
  easeInOut: {
    name: 'Ease In-Out',
    description: 'Smooth acceleration and deceleration',
    easing: easings.easeInOutQuad,
  },
  sprint: {
    name: 'Sprint',
    description: 'Explosive start, maintains speed',
    easing: (t: number) => {
      // Quick acceleration in first 20%, then linear
      if (t < 0.2) {
        return Math.pow(t * 5, 0.5) * 0.2
      }
      return 0.2 + (t - 0.2) * 1.0
    },
  },
  decelerate: {
    name: 'Decelerate',
    description: 'Natural running motion with slowdown',
    easing: (t: number) => {
      // Cubic ease-out for natural deceleration
      return 1 - Math.pow(1 - t, 3)
    },
  },
  explosive: {
    name: 'Explosive',
    description: 'Maximum initial acceleration',
    easing: (t: number) => {
      // Exponential start
      return 1 - Math.pow(2, -10 * t)
    },
  },
  cautious: {
    name: 'Cautious',
    description: 'Slow, measured approach',
    easing: (t: number) => {
      // Slower ease-in with plateau
      return t < 0.3 ? Math.pow(t / 0.3, 2) * 0.3 : 0.3 + (t - 0.3) * (0.7 / 0.7)
    },
  },
}

// Storage for per-player speed curves
const playerSpeedCurves = new Map<string, SpeedCurveType>()

// Set speed curve for a player
export function setPlayerSpeedCurve(playerId: string, curveType: SpeedCurveType): void {
  playerSpeedCurves.set(playerId, curveType)
}

// Get speed curve for a player (defaults to easeInOut)
export function getPlayerSpeedCurve(playerId: string): SpeedCurveType {
  return playerSpeedCurves.get(playerId) || 'easeInOut'
}

// Get easing function for a player
export function getPlayerEasing(playerId: string): EasingFunction {
  const curveType = getPlayerSpeedCurve(playerId)
  return SPEED_CURVES[curveType].easing
}

// Clear all player speed curves
export function clearPlayerSpeedCurves(): void {
  playerSpeedCurves.clear()
}

// Export all speed curves as JSON
export function exportSpeedCurves(): Record<string, SpeedCurveType> {
  const result: Record<string, SpeedCurveType> = {}
  playerSpeedCurves.forEach((curve, playerId) => {
    result[playerId] = curve
  })
  return result
}

// Import speed curves from JSON
export function importSpeedCurves(data: Record<string, SpeedCurveType>): void {
  Object.entries(data).forEach(([playerId, curveType]) => {
    if (SPEED_CURVES[curveType]) {
      playerSpeedCurves.set(playerId, curveType)
    }
  })
}

// Get all available curve types for UI
export function getAvailableSpeedCurves(): Array<{ type: SpeedCurveType; name: string; description: string }> {
  return Object.entries(SPEED_CURVES).map(([type, data]) => ({
    type: type as SpeedCurveType,
    name: data.name,
    description: data.description,
  }))
}
