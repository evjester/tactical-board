// Custom formation templates - save and manage user-created formations
import type { Player } from '../types'

export interface CustomFormation {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
  // Positions as relative coordinates (0-1)
  positions: Array<{
    relativeX: number
    relativeY: number
    positionCode: string
    number: number
  }>
  team: 'home' | 'away' | 'either'
}

const STORAGE_KEY = 'tactical-board-custom-formations'

// Get all custom formations
export function getCustomFormations(): CustomFormation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Save a new custom formation
export function saveCustomFormation(
  name: string,
  players: Player[],
  pitchWidth: number,
  pitchHeight: number,
  team: 'home' | 'away' | 'either' = 'either',
  description?: string
): CustomFormation {
  const formations = getCustomFormations()

  const newFormation: CustomFormation = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    positions: players.map((p) => ({
      relativeX: p.x / pitchWidth,
      relativeY: p.y / pitchHeight,
      positionCode: p.positionCode,
      number: p.number,
    })),
    team,
  }

  formations.push(newFormation)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formations))

  return newFormation
}

// Update an existing formation
export function updateCustomFormation(
  id: string,
  updates: Partial<Omit<CustomFormation, 'id' | 'createdAt'>>
): CustomFormation | null {
  const formations = getCustomFormations()
  const index = formations.findIndex((f) => f.id === id)

  if (index === -1) return null

  formations[index] = {
    ...formations[index],
    ...updates,
    updatedAt: Date.now(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(formations))
  return formations[index]
}

// Delete a custom formation
export function deleteCustomFormation(id: string): boolean {
  const formations = getCustomFormations()
  const filtered = formations.filter((f) => f.id !== id)

  if (filtered.length === formations.length) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

// Convert custom formation to player positions for loading
export function customFormationToPositions(
  formation: CustomFormation,
  pitchWidth: number,
  pitchHeight: number,
  team: 'home' | 'away'
): Array<{ x: number; y: number; positionCode: string }> {
  return formation.positions.map((pos) => {
    // For away team, flip Y position
    const y = team === 'away' ? 1 - pos.relativeY : pos.relativeY

    return {
      x: pos.relativeX * pitchWidth,
      y: y * pitchHeight,
      positionCode: pos.positionCode,
    }
  })
}

// Export formation as JSON string
export function exportFormation(formation: CustomFormation): string {
  return JSON.stringify(formation, null, 2)
}

// Import formation from JSON string
export function importFormation(jsonString: string): CustomFormation | null {
  try {
    const data = JSON.parse(jsonString)

    // Validate basic structure
    if (
      !data.name ||
      !Array.isArray(data.positions) ||
      data.positions.length === 0
    ) {
      return null
    }

    // Create new formation with new ID
    const formation: CustomFormation = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: data.name,
      description: data.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      positions: data.positions.map((p: any) => ({
        relativeX: typeof p.relativeX === 'number' ? p.relativeX : 0.5,
        relativeY: typeof p.relativeY === 'number' ? p.relativeY : 0.5,
        positionCode: p.positionCode || '',
        number: p.number || 1,
      })),
      team: data.team || 'either',
    }

    // Save it
    const formations = getCustomFormations()
    formations.push(formation)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formations))

    return formation
  } catch {
    return null
  }
}

// Get suggested name based on formation pattern
export function suggestFormationName(players: Player[]): string {
  // Count players by vertical third (defense, midfield, attack)
  const thirds = { defense: 0, midfield: 0, attack: 0 }

  players.forEach((p) => {
    if (p.positionCode === 'GK') return

    // Assuming standard pitch orientation
    const relY = p.y
    if (relY > 0.66) {
      thirds.defense++
    } else if (relY > 0.33) {
      thirds.midfield++
    } else {
      thirds.attack++
    }
  })

  // Simple formation string
  const formationString = `${thirds.defense}-${thirds.midfield}-${thirds.attack}`
  return `Custom ${formationString}`
}
