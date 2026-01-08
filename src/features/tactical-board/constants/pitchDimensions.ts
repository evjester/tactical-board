// FIFA standard pitch dimensions (in meters) mapped to canvas pixels
export const PITCH = {
  // Real dimensions (meters)
  REAL_WIDTH: 105,
  REAL_HEIGHT: 68,

  // Canvas dimensions (pixels) - 10:1 scale
  CANVAS_WIDTH: 1050,
  CANVAS_HEIGHT: 680,

  // Scale factor (1 meter = 10 pixels)
  SCALE: 10,

  // Line width for pitch markings
  LINE_WIDTH: 2,

  // Key dimensions (in meters, multiply by SCALE for pixels)
  PENALTY_AREA: {
    WIDTH: 40.3, // 16.5m from each goal post
    DEPTH: 16.5,
  },
  GOAL_AREA: {
    WIDTH: 18.32, // 5.5m from each goal post
    DEPTH: 5.5,
  },
  CENTER_CIRCLE_RADIUS: 9.15,
  PENALTY_SPOT: 11, // Distance from goal line
  PENALTY_ARC_RADIUS: 9.15,
  CORNER_ARC_RADIUS: 1,
  GOAL_WIDTH: 7.32,

  // Zones for position detection (as percentages of pitch height, 0 = defensive end)
  ZONES: {
    goalkeeper: { yMin: 0, yMax: 0.1 },
    defense: { yMin: 0.1, yMax: 0.35 },
    defensiveMidfield: { yMin: 0.35, yMax: 0.45 },
    midfield: { yMin: 0.45, yMax: 0.55 },
    attackingMidfield: { yMin: 0.55, yMax: 0.65 },
    attack: { yMin: 0.65, yMax: 1 },
  },

  // Horizontal zones for left/right detection
  HORIZONTAL_ZONES: {
    left: { xMin: 0, xMax: 0.25 },
    leftCenter: { xMin: 0.25, xMax: 0.4 },
    center: { xMin: 0.4, xMax: 0.6 },
    rightCenter: { xMin: 0.6, xMax: 0.75 },
    right: { xMin: 0.75, xMax: 1 },
  },
} as const

// View modes for the pitch
export type PitchView = 'full' | 'half' | 'vertical'

// Get canvas dimensions based on view
export function getPitchDimensions(view: PitchView = 'full') {
  switch (view) {
    case 'half':
      // Half pitch in vertical orientation (one half of the field)
      return {
        width: PITCH.CANVAS_HEIGHT, // Same as vertical (68m side)
        height: PITCH.CANVAS_WIDTH / 2, // Half of vertical height (52.5m)
      }
    case 'vertical':
      // Full pitch in vertical orientation (goals at top/bottom)
      return {
        width: PITCH.CANVAS_HEIGHT,
        height: PITCH.CANVAS_WIDTH,
      }
    case 'full':
    default:
      // Full pitch in horizontal orientation (goals at left/right)
      return {
        width: PITCH.CANVAS_WIDTH,
        height: PITCH.CANVAS_HEIGHT,
      }
  }
}

// Convert percentage coordinates to canvas pixels
export function percentToCanvas(
  xPercent: number,
  yPercent: number,
  view: PitchView = 'full'
): { x: number; y: number } {
  const { width, height } = getPitchDimensions(view)
  return {
    x: xPercent * width,
    y: yPercent * height,
  }
}

// Convert canvas pixels to percentage coordinates
export function canvasToPercent(
  x: number,
  y: number,
  view: PitchView = 'full'
): { xPercent: number; yPercent: number } {
  const { width, height } = getPitchDimensions(view)
  return {
    xPercent: x / width,
    yPercent: y / height,
  }
}

// Constrain coordinates within pitch boundaries
export function constrainToPitch(
  x: number,
  y: number,
  padding: number = 20,
  view: PitchView = 'full'
): { x: number; y: number } {
  const { width, height } = getPitchDimensions(view)
  return {
    x: Math.max(padding, Math.min(width - padding, x)),
    y: Math.max(padding, Math.min(height - padding, y)),
  }
}
