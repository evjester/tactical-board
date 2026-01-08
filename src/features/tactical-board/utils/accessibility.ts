// Accessibility utilities for the Tactical Board

// ARIA labels for tools
export const TOOL_ARIA_LABELS: Record<string, string> = {
  select: 'Select tool - Click to select and move elements (V)',
  pan: 'Pan tool - Click and drag to move the canvas (H)',
  homePlayer: 'Home player tool - Click to add a home team player (P)',
  awayPlayer: 'Away player tool - Click to add an away team player',
  ball: 'Ball tool - Click to add a ball to the pitch (B)',
  line: 'Line tool - Draw straight lines (L)',
  arrow: 'Arrow tool - Draw arrows to show movement (A)',
  dottedLine: 'Dotted line tool - Draw dotted lines',
  dottedArrow: 'Dotted arrow tool - Draw dotted arrows',
  dashedLine: 'Dashed line tool - Draw dashed lines',
  dashedArrow: 'Dashed arrow tool - Draw dashed arrows',
  curve: 'Curved line tool - Draw curved lines (C)',
  curvedArrow: 'Curved arrow tool - Draw curved arrows',
  freehand: 'Freehand tool - Draw freely on the canvas (D)',
  rectangle: 'Rectangle tool - Draw rectangles (R)',
  ellipse: 'Ellipse tool - Draw circles and ellipses (O)',
  triangle: 'Triangle tool - Draw triangles',
  text: 'Text tool - Add text annotations (T)',
  zone: 'Zone tool - Highlight tactical zones',
  offsideLine: 'Offside line tool - Draw offside lines',
  measurement: 'Measurement tool - Measure distances',
  pressingTrigger: 'Pressing trigger tool - Mark pressing zones',
  movementArrow: 'Movement arrow tool - Show player runs',
  eraser: 'Eraser tool - Delete elements',
}

// Screen reader announcements
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Generate description for player
export function getPlayerDescription(player: {
  number: number
  name?: string
  team: 'home' | 'away'
  positionCode: string
}): string {
  const teamName = player.team === 'home' ? 'Home team' : 'Away team'
  const name = player.name ? `, ${player.name}` : ''
  const position = player.positionCode ? `, ${player.positionCode}` : ''
  return `${teamName} player number ${player.number}${name}${position}`
}

// Generate description for animation state
export function getAnimationStateDescription(
  isPlaying: boolean,
  currentFrame: number,
  totalFrames: number
): string {
  if (totalFrames === 0) {
    return 'No animation frames. Add keyframes to create an animation.'
  }

  if (isPlaying) {
    return `Animation playing. Frame ${currentFrame + 1} of ${totalFrames}.`
  }

  return `Animation paused at frame ${currentFrame + 1} of ${totalFrames}.`
}

// Focus trap for modals
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (focusableElements.length === 0) return () => {}

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  firstElement.focus()

  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

// Keyboard navigation helpers
export interface KeyboardNavigationOptions {
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
  onEnter?: () => void
  onEscape?: () => void
  onDelete?: () => void
}

export function handleKeyboardNavigation(
  e: React.KeyboardEvent,
  options: KeyboardNavigationOptions
): void {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      options.onUp?.()
      break
    case 'ArrowDown':
      e.preventDefault()
      options.onDown?.()
      break
    case 'ArrowLeft':
      e.preventDefault()
      options.onLeft?.()
      break
    case 'ArrowRight':
      e.preventDefault()
      options.onRight?.()
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      options.onEnter?.()
      break
    case 'Escape':
      options.onEscape?.()
      break
    case 'Delete':
    case 'Backspace':
      options.onDelete?.()
      break
  }
}

// Generate skip links for accessibility
export function getSkipLinks(): Array<{ id: string; label: string }> {
  return [
    { id: 'main-toolbar', label: 'Skip to main toolbar' },
    { id: 'tactical-canvas', label: 'Skip to tactical board canvas' },
    { id: 'sidebar', label: 'Skip to sidebar' },
    { id: 'timeline', label: 'Skip to animation timeline' },
  ]
}

// Color contrast checker (WCAG AA requires 4.5:1 for normal text)
export function checkColorContrast(foreground: string, background: string): {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
} {
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace('#', '').match(/.{2}/g)?.map((c) => parseInt(c, 16) / 255) || [0, 0, 0]
    const adjusted = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
    return adjusted[0] * 0.2126 + adjusted[1] * 0.7152 + adjusted[2] * 0.0722
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  }
}

// Generate high contrast alternative colors
export function getHighContrastColor(baseColor: string, isDark: boolean): string {
  // Simple high contrast alternatives
  const highContrastMap: Record<string, { light: string; dark: string }> = {
    '#3b82f6': { light: '#1d4ed8', dark: '#60a5fa' }, // blue
    '#ef4444': { light: '#b91c1c', dark: '#f87171' }, // red
    '#22c55e': { light: '#15803d', dark: '#4ade80' }, // green
    '#f59e0b': { light: '#b45309', dark: '#fbbf24' }, // yellow
    '#8b5cf6': { light: '#6d28d9', dark: '#a78bfa' }, // purple
  }

  const mapping = highContrastMap[baseColor.toLowerCase()]
  if (mapping) {
    return isDark ? mapping.dark : mapping.light
  }

  return baseColor
}
