// Drawing element types for the tactical board

export type DrawingType =
  | 'line'
  | 'arrow'
  | 'dottedLine'
  | 'dottedArrow'
  | 'dashedLine'
  | 'dashedArrow'
  | 'curve'
  | 'curvedArrow'
  | 'freehand'
  | 'rectangle'
  | 'ellipse'
  | 'triangle'
  | 'text'
  | 'zone'
  | 'freehandZone'
  | 'offsideLine'
  | 'measurement'
  | 'pressingTrigger'
  | 'playerRun'
  | 'passingLane'
  | 'defensiveLine'
  | 'highlighter'
  | 'sprayArrows'

export type LineStyle = 'solid' | 'dotted' | 'dashed'
export type ArrowHeadPosition = 'none' | 'end' | 'start' | 'both'

export interface BaseDrawing {
  id: string
  type: DrawingType
  color: string
  strokeWidth: number
  opacity: number
  zIndex: number
  isSelected: boolean
}

export interface LineDrawing extends BaseDrawing {
  type: 'line' | 'arrow' | 'dottedLine' | 'dottedArrow' | 'dashedLine' | 'dashedArrow'
  points: [number, number, number, number] // [x1, y1, x2, y2]
  lineStyle: LineStyle
  arrowHead: ArrowHeadPosition
}

export interface CurvedLineDrawing extends BaseDrawing {
  type: 'curve' | 'curvedArrow'
  // Points: [startX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY]
  // For quadratic: [startX, startY, controlX, controlY, endX, endY]
  points: number[]
  tension: number
  arrowHead: ArrowHeadPosition
}

export interface FreehandDrawing extends BaseDrawing {
  type: 'freehand'
  points: number[] // [x1, y1, x2, y2, ...]
}

export interface ShapeDrawing extends BaseDrawing {
  type: 'rectangle' | 'ellipse' | 'triangle'
  x: number
  y: number
  width: number
  height: number
  fill: string | null
  rotation: number
}

export interface TextDrawing extends BaseDrawing {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
  fontFamily: string
  fontStyle: 'normal' | 'bold' | 'italic'
  rotation: number
}

// Zone/area highlighting
export interface ZoneDrawing extends BaseDrawing {
  type: 'zone'
  points: number[] // Polygon points [x1, y1, x2, y2, ...]
  fill: string
  fillOpacity: number
}

// Offside line - horizontal line across pitch
export interface OffsideLineDrawing extends BaseDrawing {
  type: 'offsideLine'
  y: number // Y position of the line
  label?: string // Optional label like "Offside"
}

// Distance measurement between two points
export interface MeasurementDrawing extends BaseDrawing {
  type: 'measurement'
  points: [number, number, number, number] // [x1, y1, x2, y2]
  showDistance: boolean
  unit: 'meters' | 'yards'
}

// Pressing trigger zone
export interface PressingTriggerDrawing extends BaseDrawing {
  type: 'pressingTrigger'
  x: number
  y: number
  radius: number
  triggerType: 'press' | 'cover' | 'mark'
}

// Freehand zone - draw any shape freehand that becomes a filled zone
export interface FreehandZoneDrawing extends BaseDrawing {
  type: 'freehandZone'
  points: number[] // Freehand points that form a closed shape
  fill: string
  fillOpacity: number
}

// Player run - curved arrow with dotted trail for showing player movement
export interface PlayerRunDrawing extends BaseDrawing {
  type: 'playerRun'
  points: number[] // Curve points
  arrowHead: ArrowHeadPosition
}

// Passing lane - line showing passing options
export interface PassingLaneDrawing extends BaseDrawing {
  type: 'passingLane'
  points: [number, number, number, number]
  lineStyle: 'solid' | 'dotted' | 'dashed'
}

// Defensive line - horizontal line for defensive positioning
export interface DefensiveLineDrawing extends BaseDrawing {
  type: 'defensiveLine'
  y: number
  startX: number
  endX: number
}

// Highlighter - semi-transparent freehand marker
export interface HighlighterDrawing extends BaseDrawing {
  type: 'highlighter'
  points: number[]
}

// Spray arrows - multiple arrows from one origin point
export interface SprayArrowsDrawing extends BaseDrawing {
  type: 'sprayArrows'
  originX: number
  originY: number
  endpoints: Array<{ x: number; y: number }>
}

export type DrawingElement =
  | LineDrawing
  | CurvedLineDrawing
  | FreehandDrawing
  | ShapeDrawing
  | TextDrawing
  | ZoneDrawing
  | FreehandZoneDrawing
  | OffsideLineDrawing
  | MeasurementDrawing
  | PressingTriggerDrawing
  | PlayerRunDrawing
  | PassingLaneDrawing
  | DefensiveLineDrawing
  | HighlighterDrawing
  | SprayArrowsDrawing

// Active drawing state (while drawing)
export interface ActiveDrawing {
  type: DrawingType
  points: number[]
  color: string
  strokeWidth: number
  lineStyle: LineStyle
  arrowHead: ArrowHeadPosition
}

// Drawing tool configuration
export interface DrawingToolConfig {
  type: DrawingType
  color: string
  strokeWidth: number
  lineStyle: LineStyle
  arrowHead: ArrowHeadPosition
  fill: string | null
  fontSize: number
}
