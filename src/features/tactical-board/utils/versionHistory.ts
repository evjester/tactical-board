// Version history for tactics

export interface TacticVersion {
  id: string
  tacticId: string
  name: string
  description?: string
  snapshot: {
    players: unknown[]
    ball: unknown | null
    drawings: unknown[]
  }
  createdAt: number
  createdBy: string
}

export interface TacticVersionHistory {
  tacticId: string
  versions: TacticVersion[]
  maxVersions: number
}

const STORAGE_KEY = 'tactical-board-versions'
const MAX_VERSIONS = 20

// Get all version histories
function getVersionHistories(): Record<string, TacticVersionHistory> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Save version histories
function saveVersionHistories(histories: Record<string, TacticVersionHistory>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(histories))
}

// Get version history for a tactic
export function getVersionHistory(tacticId: string): TacticVersionHistory {
  const histories = getVersionHistories()
  return (
    histories[tacticId] || {
      tacticId,
      versions: [],
      maxVersions: MAX_VERSIONS,
    }
  )
}

// Create a new version snapshot
export function createVersion(
  tacticId: string,
  name: string,
  snapshot: { players: unknown[]; ball: unknown | null; drawings: unknown[] },
  description?: string,
  createdBy: string = 'User'
): TacticVersion {
  const histories = getVersionHistories()
  const history = histories[tacticId] || {
    tacticId,
    versions: [],
    maxVersions: MAX_VERSIONS,
  }

  const version: TacticVersion = {
    id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tacticId,
    name,
    description,
    snapshot,
    createdAt: Date.now(),
    createdBy,
  }

  // Add to beginning of array
  history.versions.unshift(version)

  // Trim old versions if exceeding max
  if (history.versions.length > history.maxVersions) {
    history.versions = history.versions.slice(0, history.maxVersions)
  }

  histories[tacticId] = history
  saveVersionHistories(histories)

  return version
}

// Get a specific version
export function getVersion(tacticId: string, versionId: string): TacticVersion | null {
  const history = getVersionHistory(tacticId)
  return history.versions.find((v) => v.id === versionId) || null
}

// Delete a version
export function deleteVersion(tacticId: string, versionId: string): void {
  const histories = getVersionHistories()
  const history = histories[tacticId]

  if (!history) return

  history.versions = history.versions.filter((v) => v.id !== versionId)
  histories[tacticId] = history
  saveVersionHistories(histories)
}

// Compare two versions (returns differences)
export function compareVersions(
  version1: TacticVersion,
  version2: TacticVersion
): {
  playersAdded: number
  playersRemoved: number
  playersModified: number
  drawingsAdded: number
  drawingsRemoved: number
  ballChanged: boolean
} {
  const p1 = version1.snapshot.players as Array<{ id: string }>
  const p2 = version2.snapshot.players as Array<{ id: string }>
  const d1 = version1.snapshot.drawings as Array<{ id: string }>
  const d2 = version2.snapshot.drawings as Array<{ id: string }>

  const p1Ids = new Set(p1.map((p) => p.id))
  const p2Ids = new Set(p2.map((p) => p.id))
  const d1Ids = new Set(d1.map((d) => d.id))
  const d2Ids = new Set(d2.map((d) => d.id))

  return {
    playersAdded: [...p2Ids].filter((id) => !p1Ids.has(id)).length,
    playersRemoved: [...p1Ids].filter((id) => !p2Ids.has(id)).length,
    playersModified: [...p1Ids].filter((id) => p2Ids.has(id)).length,
    drawingsAdded: [...d2Ids].filter((id) => !d1Ids.has(id)).length,
    drawingsRemoved: [...d1Ids].filter((id) => !d2Ids.has(id)).length,
    ballChanged: JSON.stringify(version1.snapshot.ball) !== JSON.stringify(version2.snapshot.ball),
  }
}

// Clear all versions for a tactic
export function clearVersionHistory(tacticId: string): void {
  const histories = getVersionHistories()
  delete histories[tacticId]
  saveVersionHistories(histories)
}

// Get recent versions across all tactics
export function getRecentVersions(limit: number = 10): TacticVersion[] {
  const histories = getVersionHistories()
  const allVersions: TacticVersion[] = []

  Object.values(histories).forEach((history) => {
    allVersions.push(...history.versions)
  })

  return allVersions.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

// Format date for display
export function formatVersionDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  // Otherwise, show date
  return date.toLocaleDateString()
}
