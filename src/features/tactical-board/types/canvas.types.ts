// Canvas and UI types for the tactical board
import type { PitchView } from '../constants/pitchDimensions'
import type { PitchTheme } from '../constants/colors'

// Tool types
export type ToolType =
  | 'select'
  | 'pan'
  | 'homePlayer'
  | 'awayPlayer'
  | 'ball'
  | 'cone'
  | 'mannequin'
  | 'pole'
  | 'ladder'
  | 'hurdle'
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
  | 'eraser'
  | 'movementArrow'
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

// Canvas state
export interface CanvasState {
  zoom: number
  panX: number
  panY: number
  pitchView: PitchView
  pitchTheme: PitchTheme
  gridSnap: boolean
  gridSize: number
  showGrid: boolean
}

// UI state
export interface UIState {
  activeTool: ToolType
  activeColor: string
  strokeWidth: number
  fillColor: string | null
  fontSize: number
  sidebarOpen: boolean
  sidebarTab: 'formations' | 'templates' | 'properties' | 'layers'
  timelineOpen: boolean
  isDrawing: boolean
  isDragging: boolean
}

// Team colors state
export interface TeamColors {
  home: {
    primary: string
    secondary: string
  }
  away: {
    primary: string
    secondary: string
  }
}

// History entry for undo/redo
export interface HistoryEntry {
  id: string
  timestamp: number
  type: 'player' | 'drawing' | 'equipment' | 'canvas' | 'batch'
  description: string
  previousState: unknown
  newState: unknown
}

// Canvas dimensions
export interface CanvasDimensions {
  width: number
  height: number
  scale: number
}

// Mouse/touch position
export interface Point {
  x: number
  y: number
}

// Selection box
export interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

// Layer names for layer management
export type LayerName = 'homePlayers' | 'awayPlayers' | 'ball' | 'equipment' | 'drawings' | 'ghostTrails'

// Layer state for visibility and locking
export interface LayerState {
  visible: boolean
  locked: boolean
}

// All layers state
export interface LayersState {
  homePlayers: LayerState
  awayPlayers: LayerState
  ball: LayerState
  equipment: LayerState
  drawings: LayerState
  ghostTrails: LayerState
}
