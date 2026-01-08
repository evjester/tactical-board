// Share tactics via URL encoding
import type { Player, Ball, DrawingElement } from '../types'

export interface ShareableTactic {
  version: number
  name?: string
  players: Array<{
    x: number
    y: number
    number: number
    name: string
    team: 'home' | 'away'
    positionCode: string
    primaryColor: string
    secondaryColor: string
  }>
  ball?: { x: number; y: number }
  drawings: Array<{
    type: string
    points?: number[]
    stroke: string
    strokeWidth: number
    fill?: string
  }>
}

// Compress state for URL sharing
export function encodeStateForUrl(
  players: Player[],
  ball: Ball | null,
  drawings: DrawingElement[],
  name?: string
): string {
  const shareable: ShareableTactic = {
    version: 1,
    name,
    players: players.map((p) => ({
      x: Math.round(p.x),
      y: Math.round(p.y),
      number: p.number,
      name: p.name,
      team: p.team,
      positionCode: p.positionCode,
      primaryColor: p.primaryColor,
      secondaryColor: p.secondaryColor,
    })),
    ball: ball ? { x: Math.round(ball.x), y: Math.round(ball.y) } : undefined,
    drawings: drawings.map((d) => ({
      type: d.type,
      points: 'points' in d ? (d.points as number[]).map((p) => Math.round(p)) : undefined,
      stroke: d.color,
      strokeWidth: d.strokeWidth,
      fill: 'fill' in d ? (d as { fill?: string }).fill : undefined,
    })),
  }

  // Convert to JSON, then base64
  const json = JSON.stringify(shareable)
  const base64 = btoa(encodeURIComponent(json))
  return base64
}

// Decode state from URL
export function decodeStateFromUrl(encoded: string): ShareableTactic | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const data = JSON.parse(json) as ShareableTactic

    // Validate basic structure
    if (typeof data.version !== 'number' || !Array.isArray(data.players)) {
      return null
    }

    return data
  } catch {
    return null
  }
}

// Generate shareable URL
export function generateShareUrl(
  players: Player[],
  ball: Ball | null,
  drawings: DrawingElement[],
  name?: string
): string {
  const encoded = encodeStateForUrl(players, ball, drawings, name)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?tactic=${encoded}`
}

// Check if URL has shared tactic
export function getSharedTacticFromUrl(): ShareableTactic | null {
  const params = new URLSearchParams(window.location.search)
  const tacticParam = params.get('tactic')

  if (!tacticParam) return null

  return decodeStateFromUrl(tacticParam)
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Generate short share code (for display)
export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
