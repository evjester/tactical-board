import type { Player } from '../types'
import type { PitchView } from '../constants/pitchDimensions'
import { PITCH } from '../constants/pitchDimensions'
import { FORMATIONS } from '../constants/formations'

interface FormationLine {
  count: number
  avgY: number
}

/**
 * Detect the formation code (e.g., "4-4-2", "4-3-3") based on player positions
 */
export function detectFormation(
  players: Player[],
  team: 'home' | 'away',
  view: PitchView = 'vertical'
): string {
  const teamPlayers = players.filter((p) => p.team === team)

  if (teamPlayers.length === 0) return ''
  if (teamPlayers.length < 10) return `${teamPlayers.length} players`

  // Get pitch height based on view
  let pitchHeight: number
  switch (view) {
    case 'half':
      pitchHeight = PITCH.CANVAS_HEIGHT / 2
      break
    case 'vertical':
      pitchHeight = PITCH.CANVAS_WIDTH
      break
    default:
      pitchHeight = PITCH.CANVAS_HEIGHT
  }

  // Normalize y positions to 0-1 range
  const normalizedPlayers = teamPlayers.map((p) => {
    let yNorm = p.y / pitchHeight
    // For away team, flip the y-coordinate
    if (team === 'away') {
      yNorm = 1 - yNorm
    }
    return { ...p, yNorm }
  })

  // Sort by y position (GK first)
  normalizedPlayers.sort((a, b) => a.yNorm - b.yNorm)

  // Identify lines by clustering players by y-position
  const lines = identifyLines(normalizedPlayers)

  // Generate formation code
  return generateFormationCode(lines)
}

/**
 * Cluster players into lines based on y-position
 */
function identifyLines(
  players: Array<{ yNorm: number }>
): FormationLine[] {
  if (players.length === 0) return []

  const threshold = 0.1 // 10% of pitch height difference to be in same line
  const lines: FormationLine[] = []
  let currentLine: number[] = [players[0].yNorm]

  for (let i = 1; i < players.length; i++) {
    const player = players[i]
    const lastInLine = currentLine[currentLine.length - 1]

    if (Math.abs(player.yNorm - lastInLine) <= threshold) {
      // Same line
      currentLine.push(player.yNorm)
    } else {
      // New line
      lines.push({
        count: currentLine.length,
        avgY: currentLine.reduce((a, b) => a + b, 0) / currentLine.length,
      })
      currentLine = [player.yNorm]
    }
  }

  // Add last line
  if (currentLine.length > 0) {
    lines.push({
      count: currentLine.length,
      avgY: currentLine.reduce((a, b) => a + b, 0) / currentLine.length,
    })
  }

  return lines
}

/**
 * Generate formation code from identified lines
 */
function generateFormationCode(lines: FormationLine[]): string {
  if (lines.length === 0) return ''

  // First line is usually goalkeeper (1 player)
  // Skip the GK line and generate code from outfield lines
  const outfieldLines = lines.filter((line) => line.count > 0)

  // If first line is GK (1 player near the goal), exclude it
  if (outfieldLines.length > 0 && outfieldLines[0].count === 1 && outfieldLines[0].avgY < 0.15) {
    outfieldLines.shift()
  }

  if (outfieldLines.length === 0) return ''

  // Generate code from remaining lines
  const code = outfieldLines.map((line) => line.count).join('-')

  return code
}

/**
 * Find the best matching formation template
 */
export function findMatchingFormation(
  players: Player[],
  team: 'home' | 'away',
  view: PitchView = 'vertical'
): typeof FORMATIONS[number] | null {
  const detectedCode = detectFormation(players, team, view)

  if (!detectedCode || detectedCode.includes('players')) {
    return null
  }

  // Try exact match first
  const exactMatch = FORMATIONS.find((f) => f.code === detectedCode)
  if (exactMatch) return exactMatch

  // Try to find similar formation
  const detectedParts = detectedCode.split('-').map(Number)

  let bestMatch: typeof FORMATIONS[number] | null = null
  let bestScore = Infinity

  for (const formation of FORMATIONS) {
    const formationParts = formation.code.split('-').map(Number)

    // Skip if different number of lines
    if (formationParts.length !== detectedParts.length) continue

    // Calculate difference score
    let score = 0
    for (let i = 0; i < formationParts.length; i++) {
      score += Math.abs(formationParts[i] - detectedParts[i])
    }

    if (score < bestScore) {
      bestScore = score
      bestMatch = formation
    }
  }

  // Only return if reasonably close (score <= 2)
  return bestScore <= 2 ? bestMatch : null
}

/**
 * Calculate how well current player positions match a formation template
 */
export function calculateFormationFit(
  players: Player[],
  team: 'home' | 'away',
  formationCode: string,
  view: PitchView = 'vertical'
): number {
  const teamPlayers = players.filter((p) => p.team === team)
  const formation = FORMATIONS.find((f) => f.code === formationCode)

  if (!formation || teamPlayers.length !== formation.positions.length) {
    return 0
  }

  // Get pitch dimensions
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

  // Normalize player positions
  const normalizedPlayers = teamPlayers.map((p) => ({
    x: p.x / pitchWidth,
    y: team === 'away' ? 1 - p.y / pitchHeight : p.y / pitchHeight,
  }))

  // Calculate total distance from ideal positions
  let totalDistance = 0
  const used = new Set<number>()

  for (const pos of formation.positions) {
    let minDist = Infinity
    let minIdx = -1

    for (let i = 0; i < normalizedPlayers.length; i++) {
      if (used.has(i)) continue

      const player = normalizedPlayers[i]
      const dist = Math.sqrt(
        Math.pow(player.x - pos.x, 2) + Math.pow(player.y - pos.y, 2)
      )

      if (dist < minDist) {
        minDist = dist
        minIdx = i
      }
    }

    if (minIdx !== -1) {
      used.add(minIdx)
      totalDistance += minDist
    }
  }

  // Convert distance to a 0-100 score (lower distance = higher score)
  // Max reasonable distance per player is about 0.5 (half the pitch)
  const avgDistance = totalDistance / formation.positions.length
  const score = Math.max(0, 100 - avgDistance * 200)

  return Math.round(score)
}

/**
 * Get formation recommendations based on current player positions
 */
export function getFormationRecommendations(
  players: Player[],
  team: 'home' | 'away',
  view: PitchView = 'vertical'
): Array<{ formation: typeof FORMATIONS[number]; fitScore: number }> {
  const teamPlayers = players.filter((p) => p.team === team)

  if (teamPlayers.length < 10) return []

  const recommendations: Array<{ formation: typeof FORMATIONS[number]; fitScore: number }> = []

  for (const formation of FORMATIONS) {
    if (formation.positions.length === teamPlayers.length) {
      const fitScore = calculateFormationFit(players, team, formation.code, view)
      recommendations.push({ formation, fitScore })
    }
  }

  // Sort by fit score (highest first)
  recommendations.sort((a, b) => b.fitScore - a.fitScore)

  return recommendations.slice(0, 5) // Return top 5
}
