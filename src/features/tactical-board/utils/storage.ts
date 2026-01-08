import type { Player, Ball, DrawingElement, AnimationFrame } from '../types'
import type { PitchView } from '../constants/pitchDimensions'
import type { PitchTheme } from '../constants/colors'

// Saved tactic structure
export interface SavedTactic {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  version: string
  data: TacticData
}

export interface TacticData {
  players: Player[]
  ball: Ball | null
  drawings: DrawingElement[]
  animation: {
    frames: AnimationFrame[]
  }
  canvas: {
    pitchView: PitchView
    pitchTheme: PitchTheme
  }
  teamColors: {
    home: { primary: string; secondary: string }
    away: { primary: string; secondary: string }
  }
}

const STORAGE_KEY = 'tactical-board-tactics'
const CURRENT_VERSION = '1.0.0'

/**
 * Generate a unique ID for saved tactics
 */
export function generateId(): string {
  return `tactic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all saved tactics from local storage
 */
export function getSavedTactics(): SavedTactic[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const tactics = JSON.parse(stored) as SavedTactic[]
    // Sort by most recently updated
    return tactics.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('Failed to load saved tactics:', error)
    return []
  }
}

/**
 * Save a tactic to local storage
 */
export function saveTactic(tactic: SavedTactic): boolean {
  try {
    const tactics = getSavedTactics()
    const existingIndex = tactics.findIndex((t) => t.id === tactic.id)

    if (existingIndex >= 0) {
      tactics[existingIndex] = { ...tactic, updatedAt: Date.now() }
    } else {
      tactics.push(tactic)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tactics))
    return true
  } catch (error) {
    console.error('Failed to save tactic:', error)
    return false
  }
}

/**
 * Delete a tactic from local storage
 */
export function deleteTactic(id: string): boolean {
  try {
    const tactics = getSavedTactics()
    const filtered = tactics.filter((t) => t.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to delete tactic:', error)
    return false
  }
}

/**
 * Load a specific tactic by ID
 */
export function loadTactic(id: string): SavedTactic | null {
  const tactics = getSavedTactics()
  return tactics.find((t) => t.id === id) ?? null
}

/**
 * Create a new SavedTactic from current state
 */
export function createSavedTactic(name: string, data: TacticData, existingId?: string): SavedTactic {
  const now = Date.now()
  return {
    id: existingId ?? generateId(),
    name,
    createdAt: existingId ? (loadTactic(existingId)?.createdAt ?? now) : now,
    updatedAt: now,
    version: CURRENT_VERSION,
    data,
  }
}

/**
 * Export tactic as JSON string
 */
export function exportToJson(tactic: SavedTactic): string {
  return JSON.stringify(tactic, null, 2)
}

/**
 * Import tactic from JSON string
 */
export function importFromJson(jsonString: string): SavedTactic | null {
  try {
    const parsed = JSON.parse(jsonString)
    // Validate basic structure
    if (!parsed.data || !parsed.name) {
      throw new Error('Invalid tactic format')
    }
    // Generate new ID on import to avoid conflicts
    return {
      ...parsed,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  } catch (error) {
    console.error('Failed to import tactic:', error)
    return null
  }
}

/**
 * Download a file to the user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download tactic as JSON file
 */
export function downloadTacticAsJson(tactic: SavedTactic): void {
  const json = exportToJson(tactic)
  const filename = `${tactic.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tactic.json`
  downloadFile(json, filename, 'application/json')
}

/**
 * Read file contents as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
