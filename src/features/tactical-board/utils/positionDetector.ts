import { PITCH } from '../constants/pitchDimensions'
import type { PitchView } from '../constants/pitchDimensions'

// Position codes with their typical zones
interface PositionZone {
  code: string
  name: string
  xMin: number // 0-1 percentage
  xMax: number
  yMin: number // 0-1 percentage from defensive goal
  yMax: number
  priority: number // Higher priority wins when zones overlap
}

const POSITION_ZONES: PositionZone[] = [
  // Goalkeeper
  { code: 'GK', name: 'Goalkeeper', xMin: 0.35, xMax: 0.65, yMin: 0, yMax: 0.1, priority: 10 },

  // Defenders
  { code: 'LB', name: 'Left Back', xMin: 0, xMax: 0.2, yMin: 0.1, yMax: 0.35, priority: 5 },
  { code: 'LCB', name: 'Left Center Back', xMin: 0.2, xMax: 0.4, yMin: 0.1, yMax: 0.3, priority: 5 },
  { code: 'CB', name: 'Center Back', xMin: 0.4, xMax: 0.6, yMin: 0.1, yMax: 0.3, priority: 4 },
  { code: 'RCB', name: 'Right Center Back', xMin: 0.6, xMax: 0.8, yMin: 0.1, yMax: 0.3, priority: 5 },
  { code: 'RB', name: 'Right Back', xMin: 0.8, xMax: 1, yMin: 0.1, yMax: 0.35, priority: 5 },
  { code: 'LWB', name: 'Left Wing Back', xMin: 0, xMax: 0.15, yMin: 0.25, yMax: 0.5, priority: 6 },
  { code: 'RWB', name: 'Right Wing Back', xMin: 0.85, xMax: 1, yMin: 0.25, yMax: 0.5, priority: 6 },

  // Defensive Midfielders
  { code: 'CDM', name: 'Central Def. Mid', xMin: 0.35, xMax: 0.65, yMin: 0.3, yMax: 0.45, priority: 5 },
  { code: 'LDM', name: 'Left Def. Mid', xMin: 0.25, xMax: 0.45, yMin: 0.3, yMax: 0.45, priority: 4 },
  { code: 'RDM', name: 'Right Def. Mid', xMin: 0.55, xMax: 0.75, yMin: 0.3, yMax: 0.45, priority: 4 },

  // Central Midfielders
  { code: 'LCM', name: 'Left Central Mid', xMin: 0.2, xMax: 0.4, yMin: 0.4, yMax: 0.55, priority: 4 },
  { code: 'CM', name: 'Central Midfielder', xMin: 0.4, xMax: 0.6, yMin: 0.4, yMax: 0.55, priority: 3 },
  { code: 'RCM', name: 'Right Central Mid', xMin: 0.6, xMax: 0.8, yMin: 0.4, yMax: 0.55, priority: 4 },

  // Wide Midfielders
  { code: 'LM', name: 'Left Midfielder', xMin: 0, xMax: 0.2, yMin: 0.35, yMax: 0.6, priority: 5 },
  { code: 'RM', name: 'Right Midfielder', xMin: 0.8, xMax: 1, yMin: 0.35, yMax: 0.6, priority: 5 },

  // Attacking Midfielders
  { code: 'LAM', name: 'Left Att. Mid', xMin: 0.2, xMax: 0.4, yMin: 0.55, yMax: 0.7, priority: 4 },
  { code: 'CAM', name: 'Central Att. Mid', xMin: 0.35, xMax: 0.65, yMin: 0.55, yMax: 0.7, priority: 5 },
  { code: 'RAM', name: 'Right Att. Mid', xMin: 0.6, xMax: 0.8, yMin: 0.55, yMax: 0.7, priority: 4 },

  // Wingers
  { code: 'LW', name: 'Left Winger', xMin: 0, xMax: 0.25, yMin: 0.6, yMax: 0.85, priority: 6 },
  { code: 'RW', name: 'Right Winger', xMin: 0.75, xMax: 1, yMin: 0.6, yMax: 0.85, priority: 6 },

  // Forwards
  { code: 'LST', name: 'Left Striker', xMin: 0.25, xMax: 0.45, yMin: 0.7, yMax: 1, priority: 5 },
  { code: 'ST', name: 'Striker', xMin: 0.35, xMax: 0.65, yMin: 0.75, yMax: 1, priority: 4 },
  { code: 'RST', name: 'Right Striker', xMin: 0.55, xMax: 0.75, yMin: 0.7, yMax: 1, priority: 5 },
  { code: 'CF', name: 'Center Forward', xMin: 0.35, xMax: 0.65, yMin: 0.7, yMax: 0.85, priority: 3 },
]

/**
 * Detect the position code for a player based on their canvas coordinates
 */
export function detectPosition(
  x: number,
  y: number,
  team: 'home' | 'away',
  view: PitchView = 'vertical'
): string {
  // Get pitch dimensions based on view
  let pitchWidth: number
  let pitchHeight: number

  switch (view) {
    case 'half':
      pitchWidth = PITCH.CANVAS_WIDTH
      pitchHeight = PITCH.CANVAS_HEIGHT / 2
      break
    case 'vertical':
      pitchWidth = PITCH.CANVAS_HEIGHT
      pitchHeight = PITCH.CANVAS_WIDTH
      break
    default:
      pitchWidth = PITCH.CANVAS_WIDTH
      pitchHeight = PITCH.CANVAS_HEIGHT
  }

  // Convert to percentage (0-1)
  let xPercent = x / pitchWidth
  let yPercent = y / pitchHeight

  // For away team, flip the y-coordinate since they're on the opposite end
  if (team === 'away') {
    yPercent = 1 - yPercent
  }

  // Clamp values to 0-1 range
  xPercent = Math.max(0, Math.min(1, xPercent))
  yPercent = Math.max(0, Math.min(1, yPercent))

  // Find all matching zones
  const matchingZones = POSITION_ZONES.filter(
    (zone) =>
      xPercent >= zone.xMin &&
      xPercent <= zone.xMax &&
      yPercent >= zone.yMin &&
      yPercent <= zone.yMax
  )

  if (matchingZones.length === 0) {
    // No exact match, find nearest zone
    return findNearestPosition(xPercent, yPercent)
  }

  // Return the highest priority match
  matchingZones.sort((a, b) => b.priority - a.priority)
  return matchingZones[0].code
}

/**
 * Find the nearest position when no exact zone match is found
 */
function findNearestPosition(xPercent: number, yPercent: number): string {
  let nearestZone = POSITION_ZONES[0]
  let minDistance = Infinity

  for (const zone of POSITION_ZONES) {
    // Calculate center of zone
    const zoneCenterX = (zone.xMin + zone.xMax) / 2
    const zoneCenterY = (zone.yMin + zone.yMax) / 2

    // Calculate distance
    const distance = Math.sqrt(
      Math.pow(xPercent - zoneCenterX, 2) + Math.pow(yPercent - zoneCenterY, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      nearestZone = zone
    }
  }

  return nearestZone.code
}

/**
 * Get position name from code
 */
export function getPositionName(code: string): string {
  const zone = POSITION_ZONES.find((z) => z.code === code)
  return zone?.name ?? code
}

/**
 * Get all available position codes
 */
export function getAllPositions(): Array<{ code: string; name: string }> {
  return POSITION_ZONES.map((z) => ({ code: z.code, name: z.name }))
}

/**
 * Auto-detect positions for all players on a team
 */
export function autoDetectTeamPositions(
  players: Array<{ id: string; x: number; y: number; team: 'home' | 'away' }>,
  team: 'home' | 'away',
  view: PitchView = 'vertical'
): Map<string, string> {
  const teamPlayers = players.filter((p) => p.team === team)
  const positionMap = new Map<string, string>()

  // Sort players by y position (goalkeeper first for home, last for away)
  const sortedPlayers = [...teamPlayers].sort((a, b) => {
    if (team === 'home') {
      return a.y - b.y // Ascending for home (GK at top/low y)
    }
    return b.y - a.y // Descending for away (GK at bottom/high y)
  })

  // Track used positions to avoid duplicates
  const usedPositions = new Set<string>()

  for (const player of sortedPlayers) {
    let position = detectPosition(player.x, player.y, team, view)

    // If position already used, find alternative
    if (usedPositions.has(position)) {
      // Try similar positions
      const alternatives = getSimilarPositions(position)
      const available = alternatives.find((p) => !usedPositions.has(p))
      if (available) {
        position = available
      }
    }

    usedPositions.add(position)
    positionMap.set(player.id, position)
  }

  return positionMap
}

/**
 * Get similar/alternative positions for a given position
 */
function getSimilarPositions(position: string): string[] {
  const similar: Record<string, string[]> = {
    GK: [],
    LB: ['LWB', 'LCB'],
    LCB: ['CB', 'LB'],
    CB: ['LCB', 'RCB'],
    RCB: ['CB', 'RB'],
    RB: ['RWB', 'RCB'],
    LWB: ['LB', 'LM'],
    RWB: ['RB', 'RM'],
    CDM: ['LDM', 'RDM', 'CM'],
    LDM: ['CDM', 'LCM'],
    RDM: ['CDM', 'RCM'],
    LCM: ['CM', 'LDM', 'LAM'],
    CM: ['LCM', 'RCM', 'CDM', 'CAM'],
    RCM: ['CM', 'RDM', 'RAM'],
    LM: ['LWB', 'LW', 'LCM'],
    RM: ['RWB', 'RW', 'RCM'],
    LAM: ['CAM', 'LCM', 'LW'],
    CAM: ['LAM', 'RAM', 'CF'],
    RAM: ['CAM', 'RCM', 'RW'],
    LW: ['LM', 'LAM', 'LST'],
    RW: ['RM', 'RAM', 'RST'],
    LST: ['ST', 'CF', 'LW'],
    ST: ['LST', 'RST', 'CF'],
    RST: ['ST', 'CF', 'RW'],
    CF: ['ST', 'CAM'],
  }

  return similar[position] ?? []
}
