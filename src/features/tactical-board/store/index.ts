import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import type {
  Player,
  PlayerCreateInput,
  PlayerUpdateInput,
  Ball,
  Equipment,
  EquipmentCreateInput,
  DrawingElement,
  ActiveDrawing,
  CanvasState,
  UIState,
  TeamColors,
  ToolType,
  AnimationFrame,
  AnimationState,
  HistoryEntry,
  LayersState,
  LayerName,
} from '../types'
import { TEAM_COLORS, PITCH, getPitchDimensions } from '../constants'
import type { PitchView } from '../constants/pitchDimensions'
import type { PitchTheme } from '../constants/colors'

// Store state interface
interface TacticalBoardState {
  // Canvas
  canvas: CanvasState
  // UI
  ui: UIState
  // Layers
  layers: LayersState
  // Team colors
  teamColors: TeamColors
  // Players
  players: Player[]
  selectedPlayerIds: string[]
  editingPlayerId: string | null
  // Ball
  ball: Ball | null
  // Equipment
  equipment: Equipment[]
  selectedEquipmentIds: string[]
  // Drawings
  drawings: DrawingElement[]
  selectedDrawingIds: string[]
  activeDrawing: ActiveDrawing | null
  // Animation
  animation: AnimationState
  // History
  history: {
    past: HistoryEntry[]
    future: HistoryEntry[]
  }
}

// Store actions interface
interface TacticalBoardActions {
  // Canvas actions
  setZoom: (zoom: number) => void
  setPan: (panX: number, panY: number) => void
  setPitchView: (view: PitchView) => void
  setPitchTheme: (theme: PitchTheme) => void
  toggleGridSnap: () => void
  toggleShowGrid: () => void
  resetCanvas: () => void

  // UI actions
  setActiveTool: (tool: ToolType) => void
  setActiveColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setFillColor: (color: string | null) => void
  toggleSidebar: () => void
  setSidebarTab: (tab: 'formations' | 'templates' | 'properties' | 'layers') => void
  toggleTimeline: () => void
  setIsDrawing: (isDrawing: boolean) => void
  setIsDragging: (isDragging: boolean) => void

  // Team colors actions
  setTeamColors: (team: 'home' | 'away', colors: { primary?: string; secondary?: string }) => void

  // Player actions
  addPlayer: (input: PlayerCreateInput) => string
  updatePlayer: (id: string, updates: PlayerUpdateInput) => void
  removePlayer: (id: string) => void
  removeSelectedPlayers: () => void
  selectPlayer: (id: string, multiSelect?: boolean) => void
  deselectAllPlayers: () => void
  movePlayer: (id: string, x: number, y: number) => void
  setPlayerDragging: (id: string, isDragging: boolean) => void
  setEditingPlayer: (id: string | null) => void
  loadFormation: (team: 'home' | 'away', positions: Array<{ positionCode: string; x: number; y: number }>) => void
  clearTeam: (team: 'home' | 'away') => void
  applySetPieceTemplate: (template: {
    homePositions: Array<{ x: number; y: number; positionCode: string; role?: string }>
    awayPositions: Array<{ x: number; y: number; positionCode: string; role?: string }>
    ballPosition?: { x: number; y: number }
  }) => void

  // Ball actions
  addBall: (x: number, y: number) => void
  moveBall: (x: number, y: number) => void
  removeBall: () => void
  selectBall: () => void
  deselectBall: () => void

  // Equipment actions
  addEquipment: (input: EquipmentCreateInput) => string
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  removeEquipment: (id: string) => void
  removeSelectedEquipment: () => void
  selectEquipment: (id: string, multiSelect?: boolean) => void
  deselectAllEquipment: () => void
  moveEquipment: (id: string, x: number, y: number) => void
  rotateEquipment: (id: string, rotation: number) => void
  setEquipmentDragging: (id: string, isDragging: boolean) => void

  // Drawing actions
  addDrawing: (drawing: Omit<DrawingElement, 'id' | 'isSelected'>) => string
  updateDrawing: (id: string, updates: Partial<DrawingElement>) => void
  removeDrawing: (id: string) => void
  removeSelectedDrawings: () => void
  selectDrawing: (id: string, multiSelect?: boolean) => void
  deselectAllDrawings: () => void
  setActiveDrawing: (drawing: ActiveDrawing | null) => void
  clearAllDrawings: () => void

  // Selection actions
  deselectAll: () => void
  deleteSelected: () => void

  // Animation actions
  addKeyframe: () => void
  removeKeyframe: (index: number) => void
  goToFrame: (index: number) => void
  playAnimation: () => void
  pauseAnimation: () => void
  setPlaybackSpeed: (speed: number) => void
  toggleLoop: () => void
  clearAnimation: () => void

  // History actions
  undo: () => void
  redo: () => void
  pushHistory: () => void
  clearHistory: () => void

  // Layer actions
  toggleLayerVisibility: (layer: LayerName) => void
  toggleLayerLock: (layer: LayerName) => void
  setLayerVisibility: (layer: LayerName, visible: boolean) => void
  setLayerLock: (layer: LayerName, locked: boolean) => void
}

// Combined store type
type TacticalBoardStore = TacticalBoardState & TacticalBoardActions

// Initial state
const initialCanvasState: CanvasState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  pitchView: 'full',
  pitchTheme: 'default',
  gridSnap: false,
  gridSize: 20,
  showGrid: false,
}

const initialUIState: UIState = {
  activeTool: 'select',
  activeColor: '#000000',
  strokeWidth: 3,
  fillColor: null,
  fontSize: 16,
  sidebarOpen: true,
  sidebarTab: 'formations',
  timelineOpen: false,
  isDrawing: false,
  isDragging: false,
}

const initialAnimationState: AnimationState = {
  frames: [],
  currentFrameIndex: 0,
  isPlaying: false,
  isRecording: false,
  playbackSpeed: 1,
  loop: false,
}

const initialLayersState: LayersState = {
  homePlayers: { visible: true, locked: false },
  awayPlayers: { visible: true, locked: false },
  ball: { visible: true, locked: false },
  equipment: { visible: true, locked: false },
  drawings: { visible: true, locked: false },
  ghostTrails: { visible: true, locked: false },
}

// Create the store
export const useTacticalBoardStore = create<TacticalBoardStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        canvas: initialCanvasState,
        ui: initialUIState,
        layers: initialLayersState,
        teamColors: {
          home: { ...TEAM_COLORS.home },
          away: { ...TEAM_COLORS.away },
        },
        players: [],
        selectedPlayerIds: [],
        editingPlayerId: null,
        ball: null,
        equipment: [],
        selectedEquipmentIds: [],
        drawings: [],
        selectedDrawingIds: [],
        activeDrawing: null,
        animation: initialAnimationState,
        history: {
          past: [],
          future: [],
        },

        // Canvas actions
        setZoom: (zoom) =>
          set((state) => {
            state.canvas.zoom = Math.max(0.25, Math.min(3, zoom))
          }),

        setPan: (panX, panY) =>
          set((state) => {
            state.canvas.panX = panX
            state.canvas.panY = panY
          }),

        setPitchView: (view) =>
          set((state) => {
            const oldView = state.canvas.pitchView
            if (oldView === view) return

            const oldDimensions = getPitchDimensions(oldView)
            const newDimensions = getPitchDimensions(view)

            // Transform coordinates based on view change
            // 'full' is horizontal, 'vertical' and 'half' are vertical orientations
            const isOldHorizontal = oldView === 'full'
            const isNewHorizontal = view === 'full'
            const needsRotation = isOldHorizontal !== isNewHorizontal

            const transformPoint = (x: number, y: number): { x: number; y: number } => {
              if (isOldHorizontal && !isNewHorizontal) {
                // Horizontal to vertical: 90° clockwise rotation
                return {
                  x: y * (newDimensions.width / oldDimensions.height),
                  y: (oldDimensions.width - x) * (newDimensions.height / oldDimensions.width),
                }
              } else if (!isOldHorizontal && isNewHorizontal) {
                // Vertical to horizontal: 90° counter-clockwise rotation
                return {
                  x: (oldDimensions.height - y) * (newDimensions.width / oldDimensions.height),
                  y: x * (newDimensions.height / oldDimensions.width),
                }
              }
              // Same orientation (both vertical or both horizontal), just scale proportionally
              return {
                x: (x / oldDimensions.width) * newDimensions.width,
                y: (y / oldDimensions.height) * newDimensions.height,
              }
            }

            // Transform all player positions
            state.players.forEach((player) => {
              const newPos = transformPoint(player.x, player.y)
              player.x = newPos.x
              player.y = newPos.y
              // Rotate player rotation angle if switching between vertical/horizontal orientations
              if (needsRotation) {
                player.rotation = (player.rotation + 90) % 360
              }
            })

            // Transform ball position
            if (state.ball) {
              const newPos = transformPoint(state.ball.x, state.ball.y)
              state.ball.x = newPos.x
              state.ball.y = newPos.y
            }

            // Transform drawings
            state.drawings.forEach((drawing) => {
              const drawingAny = drawing as any

              if ('points' in drawing && Array.isArray(drawingAny.points)) {
                // Transform points array (used by lines, freehand, curves, zones)
                const newPoints: number[] = []
                for (let i = 0; i < drawingAny.points.length; i += 2) {
                  const newPos = transformPoint(drawingAny.points[i], drawingAny.points[i + 1])
                  newPoints.push(newPos.x, newPos.y)
                }
                drawingAny.points = newPoints
              }

              // Handle offside line - transform y coordinate only
              if (drawingAny.type === 'offsideLine' && 'y' in drawing) {
                drawingAny.y = drawingAny.y * (newDimensions.height / oldDimensions.height)
              } else if ('x' in drawing && 'y' in drawing) {
                // Transform position for shapes and other positioned elements
                const newPos = transformPoint(drawingAny.x, drawingAny.y)
                drawingAny.x = newPos.x
                drawingAny.y = newPos.y

                // For shapes, also transform/swap width and height
                if ('width' in drawing && 'height' in drawing) {
                  if (needsRotation) {
                    const oldWidth = drawingAny.width
                    const oldHeight = drawingAny.height
                    drawingAny.width = oldHeight * (newDimensions.width / oldDimensions.height)
                    drawingAny.height = oldWidth * (newDimensions.height / oldDimensions.width)
                  }
                }
              }
            })

            // Transform animation keyframes
            state.animation.frames.forEach((frame) => {
              // Transform player positions in keyframe
              Object.keys(frame.playerPositions).forEach((playerId) => {
                const pos = frame.playerPositions[playerId]
                const newPos = transformPoint(pos.x, pos.y)
                pos.x = newPos.x
                pos.y = newPos.y
                if (needsRotation) {
                  pos.rotation = ((pos.rotation || 0) + 90) % 360
                }
              })
              // Transform ball position in keyframe
              if (frame.ballPosition) {
                const newPos = transformPoint(frame.ballPosition.x, frame.ballPosition.y)
                frame.ballPosition.x = newPos.x
                frame.ballPosition.y = newPos.y
              }
            })

            state.canvas.pitchView = view
          }),

        setPitchTheme: (theme) =>
          set((state) => {
            state.canvas.pitchTheme = theme
          }),

        toggleGridSnap: () =>
          set((state) => {
            state.canvas.gridSnap = !state.canvas.gridSnap
          }),

        toggleShowGrid: () =>
          set((state) => {
            state.canvas.showGrid = !state.canvas.showGrid
          }),

        resetCanvas: () =>
          set((state) => {
            state.canvas = { ...initialCanvasState }
          }),

        // UI actions
        setActiveTool: (tool) =>
          set((state) => {
            state.ui.activeTool = tool
          }),

        setActiveColor: (color) =>
          set((state) => {
            state.ui.activeColor = color
          }),

        setStrokeWidth: (width) =>
          set((state) => {
            state.ui.strokeWidth = width
          }),

        setFillColor: (color) =>
          set((state) => {
            state.ui.fillColor = color
          }),

        toggleSidebar: () =>
          set((state) => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen
          }),

        setSidebarTab: (tab) =>
          set((state) => {
            state.ui.sidebarTab = tab
          }),

        toggleTimeline: () =>
          set((state) => {
            state.ui.timelineOpen = !state.ui.timelineOpen
          }),

        setIsDrawing: (isDrawing) =>
          set((state) => {
            state.ui.isDrawing = isDrawing
          }),

        setIsDragging: (isDragging) =>
          set((state) => {
            state.ui.isDragging = isDragging
          }),

        // Team colors actions
        setTeamColors: (team, colors) =>
          set((state) => {
            if (colors.primary) state.teamColors[team].primary = colors.primary
            if (colors.secondary) state.teamColors[team].secondary = colors.secondary
            // Update existing players of this team
            state.players.forEach((player) => {
              if (player.team === team) {
                if (colors.primary) player.primaryColor = colors.primary
                if (colors.secondary) player.secondaryColor = colors.secondary
              }
            })
          }),

        // Player actions
        addPlayer: (input) => {
          const id = uuidv4()
          const currentState = get()
          const teamPlayers = currentState.players.filter((p) => p.team === input.team)
          const nextNumber = input.number ?? teamPlayers.length + 1
          const teamColors = currentState.teamColors[input.team]

          // Save history before adding
          get().pushHistory()

          set((state) => {
            state.players.push({
              id,
              x: input.x,
              y: input.y,
              number: nextNumber,
              name: input.name ?? '',
              team: input.team,
              positionCode: input.positionCode ?? '',
              size: input.size ?? 'large',
              rotation: 0,
              primaryColor: input.primaryColor ?? teamColors.primary,
              secondaryColor: input.secondaryColor ?? teamColors.secondary,
              isSelected: false,
              isDragging: false,
            })
          })
          return id
        },

        updatePlayer: (id, updates) =>
          set((state) => {
            const player = state.players.find((p) => p.id === id)
            if (player) {
              Object.assign(player, updates)
            }
          }),

        removePlayer: (id) => {
          get().pushHistory()
          set((state) => {
            state.players = state.players.filter((p) => p.id !== id)
            state.selectedPlayerIds = state.selectedPlayerIds.filter((pid) => pid !== id)
          })
        },

        removeSelectedPlayers: () =>
          set((state) => {
            state.players = state.players.filter((p) => !state.selectedPlayerIds.includes(p.id))
            state.selectedPlayerIds = []
          }),

        selectPlayer: (id, multiSelect = false) =>
          set((state) => {
            if (multiSelect) {
              const index = state.selectedPlayerIds.indexOf(id)
              if (index === -1) {
                state.selectedPlayerIds.push(id)
              } else {
                state.selectedPlayerIds.splice(index, 1)
              }
            } else {
              state.selectedPlayerIds = [id]
              state.selectedDrawingIds = []
              if (state.ball) state.ball.isSelected = false
            }
            // Update player isSelected state
            state.players.forEach((p) => {
              p.isSelected = state.selectedPlayerIds.includes(p.id)
            })
          }),

        deselectAllPlayers: () =>
          set((state) => {
            state.selectedPlayerIds = []
            state.players.forEach((p) => {
              p.isSelected = false
            })
          }),

        movePlayer: (id, x, y) =>
          set((state) => {
            const player = state.players.find((p) => p.id === id)
            if (player) {
              // Constrain to pitch boundaries
              const padding = player.size === 'large' ? 20 : 15
              player.x = Math.max(padding, Math.min(PITCH.CANVAS_WIDTH - padding, x))
              player.y = Math.max(padding, Math.min(PITCH.CANVAS_HEIGHT - padding, y))
            }
          }),

        setPlayerDragging: (id, isDragging) =>
          set((state) => {
            const player = state.players.find((p) => p.id === id)
            if (player) {
              player.isDragging = isDragging
            }
          }),

        setEditingPlayer: (id) =>
          set((state) => {
            state.editingPlayerId = id
          }),

        loadFormation: (team, positions) => {
          get().pushHistory()
          set((state) => {
            // Remove existing players of this team
            state.players = state.players.filter((p) => p.team !== team)
            state.selectedPlayerIds = state.selectedPlayerIds.filter(
              (id) => !state.players.some((p) => p.id === id && p.team === team)
            )

            // Get pitch dimensions based on current view
            const pitchDimensions = getPitchDimensions(state.canvas.pitchView)
            const isHorizontal = state.canvas.pitchView === 'full' // half view is vertical orientation
            const isHalfView = state.canvas.pitchView === 'half'

            // For half view, filter to only include attacking players (y > threshold)
            // and remap their positions to fill the half pitch
            const HALF_VIEW_THRESHOLD = 0.35 // Include midfielders and forwards
            let filteredPositions = positions

            if (isHalfView) {
              // Filter positions to only include players in the attacking half
              filteredPositions = positions.filter((pos) => pos.y > HALF_VIEW_THRESHOLD)
            }

            // Add new players based on formation
            // Formation positions are defined for vertical view where:
            // - x: percentage across the field (0=left, 1=right)
            // - y: percentage from defensive end (0) to attacking end (1)
            const teamColors = state.teamColors[team]
            filteredPositions.forEach((pos, index) => {
              let playerX: number
              let playerY: number

              // For half view, remap the y coordinate to fill the half pitch
              let adjustedY = pos.y
              if (isHalfView) {
                // Remap from [THRESHOLD, 1] to [0, 1]
                adjustedY = (pos.y - HALF_VIEW_THRESHOLD) / (1 - HALF_VIEW_THRESHOLD)
              }

              if (isHorizontal) {
                // For horizontal view (full pitch), transform coordinates:
                // - Formation y (attacking direction) -> canvas x (horizontal)
                // - Formation x (across field) -> canvas y (vertical)
                if (team === 'home') {
                  // Home team attacks right (y=1 maps to right side)
                  playerX = adjustedY * pitchDimensions.width
                  playerY = pos.x * pitchDimensions.height
                } else {
                  // Away team attacks left (y=1 maps to left side)
                  playerX = (1 - adjustedY) * pitchDimensions.width
                  playerY = (1 - pos.x) * pitchDimensions.height
                }
              } else {
                // For vertical view (including half view), use coordinates directly
                // For away team, flip y position so they're on the opposite side
                const yPos = team === 'away' ? 1 - adjustedY : adjustedY
                playerX = pos.x * pitchDimensions.width
                playerY = yPos * pitchDimensions.height
              }

              state.players.push({
                id: uuidv4(),
                x: playerX,
                y: playerY,
                number: index + 1,
                name: '',
                team,
                positionCode: pos.positionCode,
                size: 'large',
                rotation: 0,
                primaryColor: teamColors.primary,
                secondaryColor: teamColors.secondary,
                isSelected: false,
                isDragging: false,
              })
            })
          })
        },

        clearTeam: (team) => {
          get().pushHistory()
          set((state) => {
            const removedIds = state.players.filter((p) => p.team === team).map((p) => p.id)
            state.players = state.players.filter((p) => p.team !== team)
            state.selectedPlayerIds = state.selectedPlayerIds.filter((id) => !removedIds.includes(id))
          })
        },

        applySetPieceTemplate: (template) => {
          get().pushHistory()
          set((state) => {
            // Clear all existing players
            state.players = []
            state.selectedPlayerIds = []
            state.ball = null

            // Get pitch dimensions based on current view
            const pitchDimensions = getPitchDimensions(state.canvas.pitchView)
            const isHorizontal = state.canvas.pitchView === 'full' // half view is vertical orientation
            const isHalfView = state.canvas.pitchView === 'half'

            // For half view, filter to only include attacking players (y < threshold)
            // Set piece y=0 is attacking end, y=1 is defensive end
            const HALF_VIEW_THRESHOLD = 0.5

            // Transform function for set piece coordinates
            // Set piece templates are defined for vertical view where:
            // - x: percentage across the field (0=left, 1=right)
            // - y: percentage from attacking end (0) to defensive end (1)
            const transformPos = (posX: number, posY: number) => {
              // For half view, remap y coordinate to fill the half pitch
              let adjustedY = posY
              if (isHalfView) {
                // Remap from [0, THRESHOLD] to [0, 1]
                adjustedY = posY / HALF_VIEW_THRESHOLD
              }

              if (isHorizontal) {
                // For horizontal view (full pitch), attacking end is on the left (x=0)
                // y (vertical attacking direction) -> x (horizontal)
                // x (across field) -> y (across field)
                return {
                  x: adjustedY * pitchDimensions.width,
                  y: posX * pitchDimensions.height,
                }
              }
              // For vertical view (including half view), use coordinates directly
              return {
                x: posX * pitchDimensions.width,
                y: adjustedY * pitchDimensions.height,
              }
            }

            // Filter function for half view
            const shouldIncludePosition = (posY: number) => {
              if (!isHalfView) return true
              return posY < HALF_VIEW_THRESHOLD
            }

            // Add home team players
            const homeColors = state.teamColors.home
            const filteredHomePositions = template.homePositions.filter((pos) => shouldIncludePosition(pos.y))
            filteredHomePositions.forEach((pos, index) => {
              const transformed = transformPos(pos.x, pos.y)
              state.players.push({
                id: uuidv4(),
                x: transformed.x,
                y: transformed.y,
                number: index + 1,
                name: pos.role || '',
                team: 'home',
                positionCode: pos.positionCode,
                size: 'large',
                rotation: 0,
                primaryColor: homeColors.primary,
                secondaryColor: homeColors.secondary,
                isSelected: false,
                isDragging: false,
              })
            })

            // Add away team players
            const awayColors = state.teamColors.away
            const filteredAwayPositions = template.awayPositions.filter((pos) => shouldIncludePosition(pos.y))
            filteredAwayPositions.forEach((pos, index) => {
              const transformed = transformPos(pos.x, pos.y)
              state.players.push({
                id: uuidv4(),
                x: transformed.x,
                y: transformed.y,
                number: index + 1,
                name: pos.role || '',
                team: 'away',
                positionCode: pos.positionCode,
                size: 'large',
                rotation: 0,
                primaryColor: awayColors.primary,
                secondaryColor: awayColors.secondary,
                isSelected: false,
                isDragging: false,
              })
            })

            // Add ball if template has ball position and it's in the attacking half
            if (template.ballPosition && shouldIncludePosition(template.ballPosition.y)) {
              const ballTransformed = transformPos(template.ballPosition.x, template.ballPosition.y)
              state.ball = {
                id: uuidv4(),
                x: ballTransformed.x,
                y: ballTransformed.y,
                isSelected: false,
                isDragging: false,
              }
            }
          })
        },

        // Ball actions
        addBall: (x, y) => {
          get().pushHistory()
          set((state) => {
            state.ball = {
              id: uuidv4(),
              x,
              y,
              isSelected: false,
              isDragging: false,
            }
          })
        },

        moveBall: (x, y) =>
          set((state) => {
            if (state.ball) {
              state.ball.x = Math.max(10, Math.min(PITCH.CANVAS_WIDTH - 10, x))
              state.ball.y = Math.max(10, Math.min(PITCH.CANVAS_HEIGHT - 10, y))
            }
          }),

        removeBall: () => {
          get().pushHistory()
          set((state) => {
            state.ball = null
          })
        },

        selectBall: () =>
          set((state) => {
            if (state.ball) {
              state.ball.isSelected = true
              state.selectedPlayerIds = []
              state.selectedDrawingIds = []
              state.players.forEach((p) => (p.isSelected = false))
              state.drawings.forEach((d) => (d.isSelected = false))
            }
          }),

        deselectBall: () =>
          set((state) => {
            if (state.ball) {
              state.ball.isSelected = false
            }
          }),

        // Equipment actions
        addEquipment: (input) => {
          const id = uuidv4()
          get().pushHistory()
          set((state) => {
            state.equipment.push({
              id,
              type: input.type,
              x: input.x,
              y: input.y,
              rotation: input.rotation ?? 0,
              isSelected: false,
              isDragging: false,
              color: input.color ?? 'orange',
              height: input.height ?? 'tall',
            })
          })
          return id
        },

        updateEquipment: (id, updates) =>
          set((state) => {
            const item = state.equipment.find((e) => e.id === id)
            if (item) {
              Object.assign(item, updates)
            }
          }),

        removeEquipment: (id) => {
          get().pushHistory()
          set((state) => {
            state.equipment = state.equipment.filter((e) => e.id !== id)
            state.selectedEquipmentIds = state.selectedEquipmentIds.filter((eid) => eid !== id)
          })
        },

        removeSelectedEquipment: () =>
          set((state) => {
            state.equipment = state.equipment.filter((e) => !state.selectedEquipmentIds.includes(e.id))
            state.selectedEquipmentIds = []
          }),

        selectEquipment: (id, multiSelect = false) =>
          set((state) => {
            if (multiSelect) {
              const index = state.selectedEquipmentIds.indexOf(id)
              if (index === -1) {
                state.selectedEquipmentIds.push(id)
              } else {
                state.selectedEquipmentIds.splice(index, 1)
              }
            } else {
              state.selectedEquipmentIds = [id]
              state.selectedPlayerIds = []
              state.selectedDrawingIds = []
              if (state.ball) state.ball.isSelected = false
            }
            state.equipment.forEach((e) => {
              e.isSelected = state.selectedEquipmentIds.includes(e.id)
            })
          }),

        deselectAllEquipment: () =>
          set((state) => {
            state.selectedEquipmentIds = []
            state.equipment.forEach((e) => {
              e.isSelected = false
            })
          }),

        moveEquipment: (id, x, y) =>
          set((state) => {
            const item = state.equipment.find((e) => e.id === id)
            if (item) {
              const dimensions = getPitchDimensions(state.canvas.pitchView)
              item.x = Math.max(10, Math.min(dimensions.width - 10, x))
              item.y = Math.max(10, Math.min(dimensions.height - 10, y))
            }
          }),

        rotateEquipment: (id, rotation) =>
          set((state) => {
            const item = state.equipment.find((e) => e.id === id)
            if (item) {
              // Normalize rotation to 0-360 degrees
              item.rotation = ((rotation % 360) + 360) % 360
            }
          }),

        setEquipmentDragging: (id, isDragging) =>
          set((state) => {
            const item = state.equipment.find((e) => e.id === id)
            if (item) {
              item.isDragging = isDragging
            }
          }),

        // Drawing actions
        addDrawing: (drawing) => {
          const id = uuidv4()
          get().pushHistory()
          set((state) => {
            state.drawings.push({
              ...drawing,
              id,
              isSelected: false,
            } as DrawingElement)
          })
          return id
        },

        updateDrawing: (id, updates) =>
          set((state) => {
            const drawing = state.drawings.find((d) => d.id === id)
            if (drawing) {
              Object.assign(drawing, updates)
            }
          }),

        removeDrawing: (id) => {
          get().pushHistory()
          set((state) => {
            state.drawings = state.drawings.filter((d) => d.id !== id)
            state.selectedDrawingIds = state.selectedDrawingIds.filter((did) => did !== id)
          })
        },

        removeSelectedDrawings: () =>
          set((state) => {
            state.drawings = state.drawings.filter((d) => !state.selectedDrawingIds.includes(d.id))
            state.selectedDrawingIds = []
          }),

        selectDrawing: (id, multiSelect = false) =>
          set((state) => {
            if (multiSelect) {
              const index = state.selectedDrawingIds.indexOf(id)
              if (index === -1) {
                state.selectedDrawingIds.push(id)
              } else {
                state.selectedDrawingIds.splice(index, 1)
              }
            } else {
              state.selectedDrawingIds = [id]
              state.selectedPlayerIds = []
              if (state.ball) state.ball.isSelected = false
            }
            state.drawings.forEach((d) => {
              d.isSelected = state.selectedDrawingIds.includes(d.id)
            })
          }),

        deselectAllDrawings: () =>
          set((state) => {
            state.selectedDrawingIds = []
            state.drawings.forEach((d) => {
              d.isSelected = false
            })
          }),

        setActiveDrawing: (drawing) =>
          set((state) => {
            state.activeDrawing = drawing
          }),

        clearAllDrawings: () => {
          get().pushHistory()
          set((state) => {
            state.drawings = []
            state.selectedDrawingIds = []
            state.activeDrawing = null
          })
        },

        // Selection actions
        deselectAll: () =>
          set((state) => {
            state.selectedPlayerIds = []
            state.selectedDrawingIds = []
            state.selectedEquipmentIds = []
            state.players.forEach((p) => (p.isSelected = false))
            state.drawings.forEach((d) => (d.isSelected = false))
            state.equipment.forEach((e) => (e.isSelected = false))
            if (state.ball) state.ball.isSelected = false
          }),

        deleteSelected: () => {
          const state = get()
          const hasSelection =
            state.selectedPlayerIds.length > 0 ||
            state.selectedDrawingIds.length > 0 ||
            state.selectedEquipmentIds.length > 0 ||
            state.ball?.isSelected
          if (!hasSelection) return

          get().pushHistory()
          set((state) => {
            // Remove selected players
            state.players = state.players.filter((p) => !state.selectedPlayerIds.includes(p.id))
            state.selectedPlayerIds = []

            // Remove selected drawings
            state.drawings = state.drawings.filter((d) => !state.selectedDrawingIds.includes(d.id))
            state.selectedDrawingIds = []

            // Remove selected equipment
            state.equipment = state.equipment.filter((e) => !state.selectedEquipmentIds.includes(e.id))
            state.selectedEquipmentIds = []

            // Remove ball if selected
            if (state.ball?.isSelected) {
              state.ball = null
            }
          })
        },

        // Animation actions
        addKeyframe: () =>
          set((state) => {
            const currentState = get()
            const frame: AnimationFrame = {
              id: uuidv4(),
              index: state.animation.frames.length,
              durationMs: 1000,
              playerPositions: {},
              ballPosition: currentState.ball
                ? { x: currentState.ball.x, y: currentState.ball.y }
                : undefined,
              equipmentPositions: {},
            }

            // Store current player positions
            currentState.players.forEach((player) => {
              frame.playerPositions[player.id] = {
                x: player.x,
                y: player.y,
                rotation: player.rotation,
                movementArrow: player.movementArrow,
              }
            })

            // Store current equipment positions
            currentState.equipment.forEach((item) => {
              frame.equipmentPositions![item.id] = {
                x: item.x,
                y: item.y,
                rotation: item.rotation,
              }
            })

            state.animation.frames.push(frame)
          }),

        removeKeyframe: (index) =>
          set((state) => {
            state.animation.frames = state.animation.frames.filter((_, i) => i !== index)
            // Reindex remaining frames
            state.animation.frames.forEach((frame, i) => {
              frame.index = i
            })
            // Adjust current frame index if needed
            if (state.animation.currentFrameIndex >= state.animation.frames.length) {
              state.animation.currentFrameIndex = Math.max(0, state.animation.frames.length - 1)
            }
          }),

        goToFrame: (index) =>
          set((state) => {
            if (index >= 0 && index < state.animation.frames.length) {
              state.animation.currentFrameIndex = index
            }
          }),

        playAnimation: () =>
          set((state) => {
            state.animation.isPlaying = true
          }),

        pauseAnimation: () =>
          set((state) => {
            state.animation.isPlaying = false
          }),

        setPlaybackSpeed: (speed) =>
          set((state) => {
            state.animation.playbackSpeed = speed
          }),

        toggleLoop: () =>
          set((state) => {
            state.animation.loop = !state.animation.loop
          }),

        clearAnimation: () =>
          set((state) => {
            state.animation = { ...initialAnimationState }
          }),

        // History actions - using state snapshots
        undo: () => {
          const currentState = get()
          if (currentState.history.past.length === 0) return

          set((state) => {
            const lastSnapshot = state.history.past.pop()
            if (!lastSnapshot) return

            // Save current state to future
            state.history.future.unshift({
              id: uuidv4(),
              timestamp: Date.now(),
              type: 'batch',
              description: 'Redo snapshot',
              previousState: null,
              newState: {
                players: JSON.parse(JSON.stringify(state.players)),
                drawings: JSON.parse(JSON.stringify(state.drawings)),
                ball: state.ball ? JSON.parse(JSON.stringify(state.ball)) : null,
              },
            })

            // Restore previous state
            const snapshot = lastSnapshot.newState as {
              players: typeof state.players
              drawings: typeof state.drawings
              ball: typeof state.ball
            }
            state.players = snapshot.players
            state.drawings = snapshot.drawings
            state.ball = snapshot.ball

            // Clear selections
            state.selectedPlayerIds = []
            state.selectedDrawingIds = []
          })
        },

        redo: () => {
          const currentState = get()
          if (currentState.history.future.length === 0) return

          set((state) => {
            const nextSnapshot = state.history.future.shift()
            if (!nextSnapshot) return

            // Save current state to past
            state.history.past.push({
              id: uuidv4(),
              timestamp: Date.now(),
              type: 'batch',
              description: 'Undo snapshot',
              previousState: null,
              newState: {
                players: JSON.parse(JSON.stringify(state.players)),
                drawings: JSON.parse(JSON.stringify(state.drawings)),
                ball: state.ball ? JSON.parse(JSON.stringify(state.ball)) : null,
              },
            })

            // Restore next state
            const snapshot = nextSnapshot.newState as {
              players: typeof state.players
              drawings: typeof state.drawings
              ball: typeof state.ball
            }
            state.players = snapshot.players
            state.drawings = snapshot.drawings
            state.ball = snapshot.ball

            // Clear selections
            state.selectedPlayerIds = []
            state.selectedDrawingIds = []
          })
        },

        pushHistory: () => {
          // Save current state snapshot before changes
          const currentState = get()
          set((state) => {
            state.history.past.push({
              id: uuidv4(),
              timestamp: Date.now(),
              type: 'batch',
              description: 'State snapshot',
              previousState: null,
              newState: {
                players: JSON.parse(JSON.stringify(currentState.players)),
                drawings: JSON.parse(JSON.stringify(currentState.drawings)),
                ball: currentState.ball ? JSON.parse(JSON.stringify(currentState.ball)) : null,
              },
            })
            // Limit history size
            if (state.history.past.length > 50) {
              state.history.past.shift()
            }
            // Clear future on new action
            state.history.future = []
          })
        },

        clearHistory: () =>
          set((state) => {
            state.history = { past: [], future: [] }
          }),

        // Layer actions
        toggleLayerVisibility: (layer) =>
          set((state) => {
            state.layers[layer].visible = !state.layers[layer].visible
          }),

        toggleLayerLock: (layer) =>
          set((state) => {
            state.layers[layer].locked = !state.layers[layer].locked
          }),

        setLayerVisibility: (layer, visible) =>
          set((state) => {
            state.layers[layer].visible = visible
          }),

        setLayerLock: (layer, locked) =>
          set((state) => {
            state.layers[layer].locked = locked
          }),
      }))
    ),
    { name: 'tactical-board-store' }
  )
)

// Selector hooks for better performance
export const useCanvasState = () => useTacticalBoardStore((state) => state.canvas)
export const useUIState = () => useTacticalBoardStore((state) => state.ui)
export const useLayersState = () => useTacticalBoardStore((state) => state.layers)
export const usePlayers = () => useTacticalBoardStore((state) => state.players)
export const useSelectedPlayerIds = () => useTacticalBoardStore((state) => state.selectedPlayerIds)
export const useEditingPlayer = () => {
  const editingPlayerId = useTacticalBoardStore((state) => state.editingPlayerId)
  const players = useTacticalBoardStore((state) => state.players)
  return editingPlayerId ? players.find((p) => p.id === editingPlayerId) ?? null : null
}
export const useBall = () => useTacticalBoardStore((state) => state.ball)
export const useEquipment = () => useTacticalBoardStore((state) => state.equipment)
export const useSelectedEquipmentIds = () => useTacticalBoardStore((state) => state.selectedEquipmentIds)
export const useDrawings = () => useTacticalBoardStore((state) => state.drawings)
export const useActiveDrawing = () => useTacticalBoardStore((state) => state.activeDrawing)
export const useTeamColors = () => useTacticalBoardStore((state) => state.teamColors)
export const useAnimationState = () => useTacticalBoardStore((state) => state.animation)
