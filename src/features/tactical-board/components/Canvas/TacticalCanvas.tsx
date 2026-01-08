import { useRef, useCallback, forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { useTacticalBoardStore, useCanvasState, useUIState } from '../../store'
import { getPitchDimensions } from '../../constants'
import type { LineDrawing, FreehandDrawing, ShapeDrawing, CurvedLineDrawing, TextDrawing, ZoneDrawing, FreehandZoneDrawing, OffsideLineDrawing, MeasurementDrawing, PressingTriggerDrawing, PlayerRunDrawing, PassingLaneDrawing, DefensiveLineDrawing, HighlighterDrawing, SprayArrowsDrawing } from '../../types'
import { PitchLayer } from './PitchLayer'
import { PlayersLayer } from './PlayersLayer'
import { BallComponent } from './BallComponent'
import { EquipmentLayer } from './EquipmentLayer'
import { DrawingsLayer } from './DrawingsLayer'

interface TacticalCanvasProps {
  maxWidth?: number
  maxHeight?: number
}

export interface TacticalCanvasRef {
  getStage: () => Konva.Stage | null
}

export const TacticalCanvas = forwardRef<TacticalCanvasRef, TacticalCanvasProps>(function TacticalCanvas(
  { maxWidth, maxHeight },
  ref
) {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })

  // Expose stage to parent
  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
  }))

  // Measure container and update on resize (including when timeline opens/closes)
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement
        if (parent) {
          const rect = parent.getBoundingClientRect()
          // Account for padding in parent
          setContainerSize({
            width: maxWidth || rect.width - 32,
            height: maxHeight || rect.height - 32,
          })
        }
      }
    }

    updateSize()

    // Use ResizeObserver to detect parent size changes (e.g., when timeline opens)
    const parent = containerRef.current?.parentElement
    let resizeObserver: ResizeObserver | null = null

    if (parent) {
      resizeObserver = new ResizeObserver(() => {
        updateSize()
      })
      resizeObserver.observe(parent)
    }

    window.addEventListener('resize', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [maxWidth, maxHeight])

  const canvas = useCanvasState()
  const ui = useUIState()
  const {
    addPlayer,
    addBall,
    addEquipment,
    deselectAll,
    setActiveDrawing,
    addDrawing,
    setIsDrawing,
    setPan,
  } = useTacticalBoardStore()

  // Pan state
  const [isPanning, setIsPanning] = useState(false)
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null)

  const pitchDimensions = getPitchDimensions(canvas.pitchView)
  const nativeWidth = pitchDimensions.width
  const nativeHeight = pitchDimensions.height

  // Padding for the stage
  const stagePadding = 20

  // Calculate scale to fit the pitch in the available space
  const availableWidth = containerSize.width - stagePadding * 2
  const availableHeight = containerSize.height - stagePadding * 2
  const scaleX = availableWidth / nativeWidth
  const scaleY = availableHeight / nativeHeight
  const baseScale = Math.min(scaleX, scaleY) // Scale to fit available space

  // Apply user zoom on top of base scale
  const effectiveScale = baseScale * canvas.zoom

  // Final display dimensions
  const displayWidth = nativeWidth * effectiveScale + stagePadding * 2
  const displayHeight = nativeHeight * effectiveScale + stagePadding * 2

  // Get adjusted position accounting for scale and padding
  const getAdjustedPosition = useCallback(
    (stage: Konva.Stage) => {
      const pos = stage.getPointerPosition()
      if (!pos) return null

      // Adjust for stage padding and scale
      const adjustedX = (pos.x - stagePadding) / effectiveScale
      const adjustedY = (pos.y - stagePadding) / effectiveScale

      return { x: adjustedX, y: adjustedY }
    },
    [effectiveScale, stagePadding]
  )

  // Handle stage click for adding players or starting drawings
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (!stage) return

      const adjusted = getAdjustedPosition(stage)
      if (!adjusted) return

      const adjustedX = adjusted.x
      const adjustedY = adjusted.y

      // Zone tool - click to add polygon points (handle before clickedOnEmpty check
      // because clicking on preview elements should still add points)
      if (ui.activeTool === 'zone') {
        const activeDrawing = useTacticalBoardStore.getState().activeDrawing

        if (!activeDrawing || activeDrawing.type !== 'zone') {
          // Start new polygon
          setIsDrawing(true)
          setActiveDrawing({
            type: 'zone',
            points: [adjustedX, adjustedY],
            color: ui.activeColor,
            strokeWidth: ui.strokeWidth,
            lineStyle: 'solid',
            arrowHead: 'none',
          })
        } else {
          // Check if clicking near the first point to close polygon
          const firstX = activeDrawing.points[0]
          const firstY = activeDrawing.points[1]
          const distToFirst = Math.sqrt(
            Math.pow(adjustedX - firstX, 2) + Math.pow(adjustedY - firstY, 2)
          )

          if (activeDrawing.points.length >= 6 && distToFirst < 20) {
            // Close polygon - at least 3 points needed (6 values)
            const zoneDrawing: Omit<ZoneDrawing, 'id' | 'isSelected'> = {
              type: 'zone',
              points: activeDrawing.points,
              color: activeDrawing.color,
              strokeWidth: activeDrawing.strokeWidth,
              opacity: 1,
              zIndex: 0,
              fill: activeDrawing.color,
              fillOpacity: 0.3,
            }
            addDrawing(zoneDrawing)
            setActiveDrawing(null)
            setIsDrawing(false)
          } else {
            // Add new point to polygon
            setActiveDrawing({
              ...activeDrawing,
              points: [...activeDrawing.points, adjustedX, adjustedY],
            })
          }
        }
        return
      }

      // Check if clicked on empty space (stage itself)
      const clickedOnEmpty = e.target === stage

      if (clickedOnEmpty) {
        // Deselect all when clicking on empty space (for select tool)
        if (ui.activeTool === 'select') {
          deselectAll()
          return
        }

        // Add player based on active tool
        if (ui.activeTool === 'homePlayer') {
          addPlayer({
            x: adjustedX,
            y: adjustedY,
            team: 'home',
          })
          return
        }

        if (ui.activeTool === 'awayPlayer') {
          addPlayer({
            x: adjustedX,
            y: adjustedY,
            team: 'away',
          })
          return
        }

        // Add ball
        if (ui.activeTool === 'ball') {
          addBall(adjustedX, adjustedY)
          return
        }

        // Add equipment
        const equipmentTools = ['cone', 'mannequin', 'pole', 'ladder', 'hurdle'] as const
        if (equipmentTools.includes(ui.activeTool as typeof equipmentTools[number])) {
          addEquipment({
            type: ui.activeTool as typeof equipmentTools[number],
            x: adjustedX,
            y: adjustedY,
          })
          return
        }

        // Add text annotation
        if (ui.activeTool === 'text') {
          const text = window.prompt('Enter text:')
          if (text && text.trim()) {
            const textDrawing: Omit<TextDrawing, 'id' | 'isSelected'> = {
              type: 'text',
              x: adjustedX,
              y: adjustedY,
              text: text.trim(),
              color: ui.activeColor,
              strokeWidth: ui.strokeWidth,
              opacity: 1,
              zIndex: 0,
              fontSize: ui.fontSize || 16,
              fontFamily: 'Arial',
              fontStyle: 'normal',
              rotation: 0,
            }
            addDrawing(textDrawing)
          }
          return
        }
      }
    },
    [ui.activeTool, ui.activeColor, ui.strokeWidth, ui.fontSize, addPlayer, addBall, addEquipment, addDrawing, deselectAll, getAdjustedPosition, setActiveDrawing, setIsDrawing]
  )

  // Handle double-click to finish zone polygon
  const handleDoubleClick = useCallback(
    () => {
      if (ui.activeTool !== 'zone') return

      const activeDrawing = useTacticalBoardStore.getState().activeDrawing
      if (!activeDrawing || activeDrawing.type !== 'zone') return

      // Need at least 3 points (6 values) to create a polygon
      if (activeDrawing.points.length >= 6) {
        const zoneDrawing: Omit<ZoneDrawing, 'id' | 'isSelected'> = {
          type: 'zone',
          points: activeDrawing.points,
          color: activeDrawing.color,
          strokeWidth: activeDrawing.strokeWidth,
          opacity: 1,
          zIndex: 0,
          fill: activeDrawing.color,
          fillOpacity: 0.3,
        }
        addDrawing(zoneDrawing)
      }

      setActiveDrawing(null)
      setIsDrawing(false)
    },
    [ui.activeTool, addDrawing, setActiveDrawing, setIsDrawing]
  )

  // Handle mouse down for drawing
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (!stage) return

      // Handle pan tool
      if (ui.activeTool === 'pan') {
        setIsPanning(true)
        const pos = stage.getPointerPosition()
        if (pos) {
          lastPanPointRef.current = { x: pos.x, y: pos.y }
        }
        return
      }

      const adjusted = getAdjustedPosition(stage)
      if (!adjusted) return

      const adjustedX = adjusted.x
      const adjustedY = adjusted.y

      const drawingTools = [
        'line',
        'arrow',
        'dottedLine',
        'dottedArrow',
        'dashedLine',
        'dashedArrow',
        'curve',
        'curvedArrow',
        'freehand',
        'rectangle',
        'ellipse',
        'triangle',
        // 'zone' is handled separately via clicks, not drag
        'freehandZone',
        'offsideLine',
        'measurement',
        'pressingTrigger',
        'playerRun',
        'passingLane',
        'defensiveLine',
        'highlighter',
        'sprayArrows',
      ]

      if (drawingTools.includes(ui.activeTool)) {
        setIsDrawing(true)

        // Determine line style based on tool
        let lineStyle: 'solid' | 'dotted' | 'dashed' = 'solid'
        if (ui.activeTool.includes('dotted') || ui.activeTool === 'playerRun') {
          lineStyle = 'dotted'
        } else if (ui.activeTool.includes('dashed') || ui.activeTool === 'passingLane') {
          lineStyle = 'dashed'
        }

        // Determine arrow head based on tool
        let arrowHead: 'none' | 'end' | 'start' | 'both' = 'none'
        if (ui.activeTool.includes('arrow') || ui.activeTool.includes('Arrow') ||
            ui.activeTool === 'playerRun' || ui.activeTool === 'sprayArrows') {
          arrowHead = 'end'
        }

        setActiveDrawing({
          type: ui.activeTool as any,
          points: [adjustedX, adjustedY],
          color: ui.activeColor,
          strokeWidth: ui.activeTool === 'highlighter' ? Math.max(ui.strokeWidth * 3, 15) : ui.strokeWidth,
          lineStyle,
          arrowHead,
        })
      }
    },
    [ui.activeTool, ui.activeColor, ui.strokeWidth, setIsDrawing, setActiveDrawing, getAdjustedPosition]
  )

  // Handle mouse move for drawing
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (!stage) return

      // Handle panning
      if (isPanning && ui.activeTool === 'pan') {
        const pos = stage.getPointerPosition()
        if (pos && lastPanPointRef.current) {
          const dx = pos.x - lastPanPointRef.current.x
          const dy = pos.y - lastPanPointRef.current.y
          setPan(canvas.panX + dx, canvas.panY + dy)
          lastPanPointRef.current = { x: pos.x, y: pos.y }
        }
        return
      }

      const adjusted = getAdjustedPosition(stage)
      if (!adjusted) return

      const adjustedX = adjusted.x
      const adjustedY = adjusted.y

      const activeDrawing = useTacticalBoardStore.getState().activeDrawing

      // Handle zone preview (shows line from last point to cursor)
      if (activeDrawing && activeDrawing.type === 'zone' && ui.activeTool === 'zone') {
        // Store cursor position as the last two values for preview
        // Keep existing points but add cursor position for preview line
        if (activeDrawing.points.length === 2) {
          // Only first point exists, add cursor for preview
          setActiveDrawing({
            ...activeDrawing,
            points: [activeDrawing.points[0], activeDrawing.points[1], adjustedX, adjustedY],
          })
        } else if (activeDrawing.points.length >= 4) {
          // Has multiple points, update preview cursor position
          // Keep all established points, update cursor preview
          const establishedPoints = activeDrawing.points.length % 2 === 0
            ? activeDrawing.points.slice(0, -2)
            : activeDrawing.points
          setActiveDrawing({
            ...activeDrawing,
            points: [...establishedPoints, adjustedX, adjustedY],
          })
        }
        return
      }

      if (!ui.isDrawing) return
      if (!activeDrawing) return

      // Freehand-style drawing tools - add all points as you draw
      const freehandTools = ['freehand', 'freehandZone', 'highlighter', 'playerRun']
      if (freehandTools.includes(activeDrawing.type)) {
        // Add point to freehand path
        setActiveDrawing({
          ...activeDrawing,
          points: [...activeDrawing.points, adjustedX, adjustedY],
        })
      } else {
        // Update end point for lines/shapes
        const startX = activeDrawing.points[0]
        const startY = activeDrawing.points[1]
        setActiveDrawing({
          ...activeDrawing,
          points: [startX, startY, adjustedX, adjustedY],
        })
      }
    },
    [ui.isDrawing, ui.activeTool, isPanning, canvas.panX, canvas.panY, setPan, setActiveDrawing, getAdjustedPosition]
  )

  // Handle mouse up to finish drawing
  const handleMouseUp = useCallback(() => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false)
      lastPanPointRef.current = null
      return
    }

    if (!ui.isDrawing) return

    const activeDrawing = useTacticalBoardStore.getState().activeDrawing
    if (!activeDrawing) return

    // Zone is handled via clicks, not mouse up
    if (activeDrawing.type === 'zone') return

    setIsDrawing(false)

    // Don't add if drawing is too small
    const points = activeDrawing.points
    if (points.length < 4) {
      setActiveDrawing(null)
      return
    }

    const dx = points[points.length - 2] - points[0]
    const dy = points[points.length - 1] - points[1]
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 5) {
      setActiveDrawing(null)
      return
    }

    // Create the drawing element based on type
    if (
      activeDrawing.type === 'line' ||
      activeDrawing.type === 'arrow' ||
      activeDrawing.type === 'dottedLine' ||
      activeDrawing.type === 'dottedArrow' ||
      activeDrawing.type === 'dashedLine' ||
      activeDrawing.type === 'dashedArrow'
    ) {
      const lineDrawing: Omit<LineDrawing, 'id' | 'isSelected'> = {
        type: activeDrawing.type,
        points: [points[0], points[1], points[points.length - 2], points[points.length - 1]] as [
          number,
          number,
          number,
          number,
        ],
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        lineStyle: activeDrawing.lineStyle,
        arrowHead: activeDrawing.arrowHead,
      }
      addDrawing(lineDrawing)
    } else if (activeDrawing.type === 'freehand') {
      const freehandDrawing: Omit<FreehandDrawing, 'id' | 'isSelected'> = {
        type: 'freehand',
        points: activeDrawing.points,
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
      }
      addDrawing(freehandDrawing)
    } else if (activeDrawing.type === 'curve' || activeDrawing.type === 'curvedArrow') {
      // For curves, we create a quadratic bezier with auto-calculated control point
      const startX = points[0]
      const startY = points[1]
      const endX = points[points.length - 2]
      const endY = points[points.length - 1]

      // Calculate control point perpendicular to the line at midpoint
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2
      const dx = endX - startX
      const dy = endY - startY
      const perpX = -dy * 0.3 // Perpendicular offset
      const perpY = dx * 0.3

      const curvedDrawing: Omit<CurvedLineDrawing, 'id' | 'isSelected'> = {
        type: activeDrawing.type,
        points: [startX, startY, midX + perpX, midY + perpY, endX, endY],
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        tension: 0,
        arrowHead: activeDrawing.arrowHead,
      }
      addDrawing(curvedDrawing)
    } else if (activeDrawing.type === 'rectangle' || activeDrawing.type === 'ellipse' || activeDrawing.type === 'triangle') {
      const x = Math.min(points[0], points[2])
      const y = Math.min(points[1], points[3])
      const shapeWidth = Math.abs(points[2] - points[0])
      const shapeHeight = Math.abs(points[3] - points[1])

      const shapeDrawing: Omit<ShapeDrawing, 'id' | 'isSelected'> = {
        type: activeDrawing.type,
        x,
        y,
        width: shapeWidth,
        height: shapeHeight,
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        fill: null,
        rotation: 0,
      }
      addDrawing(shapeDrawing)
    } else if (activeDrawing.type === 'offsideLine') {
      // Offside line - perpendicular to direction of play (spans full width/height)
      // In vertical view: horizontal line at y position
      // In horizontal view: vertical line at x position (store x as y for rendering)
      const isVerticalView = canvas.pitchView === 'vertical'

      const offsideDrawing: Omit<OffsideLineDrawing, 'id' | 'isSelected'> = {
        type: 'offsideLine',
        // In vertical view: use Y (user draws horizontally at a y position)
        // In horizontal view: use X (user draws vertically at an x position)
        y: isVerticalView ? points[1] : points[0],
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        label: 'Offside',
      }
      addDrawing(offsideDrawing)
    } else if (activeDrawing.type === 'measurement') {
      const measurementDrawing: Omit<MeasurementDrawing, 'id' | 'isSelected'> = {
        type: 'measurement',
        points: [points[0], points[1], points[points.length - 2], points[points.length - 1]] as [number, number, number, number],
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        showDistance: true,
        unit: 'meters',
      }
      addDrawing(measurementDrawing)
    } else if (activeDrawing.type === 'pressingTrigger') {
      // Pressing trigger uses start point as center and distance as radius
      const dx = points[points.length - 2] - points[0]
      const dy = points[points.length - 1] - points[1]
      const radius = Math.sqrt(dx * dx + dy * dy)

      const pressingDrawing: Omit<PressingTriggerDrawing, 'id' | 'isSelected'> = {
        type: 'pressingTrigger',
        x: points[0],
        y: points[1],
        radius: Math.max(20, radius),
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        triggerType: 'press',
      }
      addDrawing(pressingDrawing)
    } else if (activeDrawing.type === 'freehandZone') {
      // Freehand zone - like freehand but becomes a filled closed shape
      const freehandZoneDrawing: Omit<FreehandZoneDrawing, 'id' | 'isSelected'> = {
        type: 'freehandZone',
        points: activeDrawing.points,
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        fill: activeDrawing.color,
        fillOpacity: 0.3,
      }
      addDrawing(freehandZoneDrawing)
    } else if (activeDrawing.type === 'playerRun') {
      // Player run - curved freehand path with arrow
      const playerRunDrawing: Omit<PlayerRunDrawing, 'id' | 'isSelected'> = {
        type: 'playerRun',
        points: activeDrawing.points,
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
        arrowHead: 'end',
      }
      addDrawing(playerRunDrawing)
    } else if (activeDrawing.type === 'passingLane') {
      // Passing lane - dashed line
      const passingLaneDrawing: Omit<PassingLaneDrawing, 'id' | 'isSelected'> = {
        type: 'passingLane',
        points: [points[0], points[1], points[points.length - 2], points[points.length - 1]] as [number, number, number, number],
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 0.7,
        zIndex: 0,
        lineStyle: 'dashed',
      }
      addDrawing(passingLaneDrawing)
    } else if (activeDrawing.type === 'defensiveLine') {
      // Defensive line - perpendicular to direction of play
      // In vertical view: horizontal line (user draws left-right, we use y and x range)
      // In horizontal view: user draws top-bottom, we store as y (their x) and startX/endX (their y range)
      const isVerticalView = canvas.pitchView === 'vertical'

      let defensiveLineDrawing: Omit<DefensiveLineDrawing, 'id' | 'isSelected'>

      if (isVerticalView) {
        // User draws horizontally, capture y position and x range
        defensiveLineDrawing = {
          type: 'defensiveLine',
          y: points[1],
          startX: Math.min(points[0], points[points.length - 2]),
          endX: Math.max(points[0], points[points.length - 2]),
          color: activeDrawing.color,
          strokeWidth: activeDrawing.strokeWidth,
          opacity: 1,
          zIndex: 0,
        }
      } else {
        // Horizontal view: user draws vertically, capture x position and y range
        // Store x as 'y' and y range as 'startX/endX' so rendering works correctly
        defensiveLineDrawing = {
          type: 'defensiveLine',
          y: points[0], // x position becomes y (will be rendered as x)
          startX: Math.min(points[1], points[points.length - 1]), // y range becomes startX/endX
          endX: Math.max(points[1], points[points.length - 1]),
          color: activeDrawing.color,
          strokeWidth: activeDrawing.strokeWidth,
          opacity: 1,
          zIndex: 0,
        }
      }
      addDrawing(defensiveLineDrawing)
    } else if (activeDrawing.type === 'highlighter') {
      // Highlighter - semi-transparent wide freehand stroke
      const highlighterDrawing: Omit<HighlighterDrawing, 'id' | 'isSelected'> = {
        type: 'highlighter',
        points: activeDrawing.points,
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 0.4,
        zIndex: 0,
      }
      addDrawing(highlighterDrawing)
    } else if (activeDrawing.type === 'sprayArrows') {
      // Spray arrows - from origin point to end point, creates one arrow
      // Multiple uses create multiple arrows from similar origin
      const sprayArrowsDrawing: Omit<SprayArrowsDrawing, 'id' | 'isSelected'> = {
        type: 'sprayArrows',
        originX: points[0],
        originY: points[1],
        endpoints: [{ x: points[points.length - 2], y: points[points.length - 1] }],
        color: activeDrawing.color,
        strokeWidth: activeDrawing.strokeWidth,
        opacity: 1,
        zIndex: 0,
      }
      addDrawing(sprayArrowsDrawing)
    }

    setActiveDrawing(null)
  }, [ui.isDrawing, isPanning, addDrawing, setActiveDrawing, setIsDrawing])

  // Get cursor based on active tool
  const getCursor = () => {
    switch (ui.activeTool) {
      case 'select':
        return 'default'
      case 'pan':
        return isPanning ? 'grabbing' : 'grab'
      case 'homePlayer':
      case 'awayPlayer':
      case 'ball':
      case 'cone':
      case 'mannequin':
      case 'pole':
      case 'ladder':
      case 'hurdle':
        return 'crosshair'
      case 'line':
      case 'arrow':
      case 'dottedLine':
      case 'dottedArrow':
      case 'dashedLine':
      case 'dashedArrow':
      case 'curve':
      case 'curvedArrow':
      case 'freehand':
      case 'rectangle':
      case 'ellipse':
      case 'triangle':
      case 'zone':
      case 'freehandZone':
      case 'offsideLine':
      case 'measurement':
      case 'pressingTrigger':
      case 'movementArrow':
      case 'playerRun':
      case 'passingLane':
      case 'defensiveLine':
      case 'highlighter':
      case 'sprayArrows':
        return 'crosshair'
      case 'eraser':
        return 'not-allowed'
      case 'text':
        return 'text'
      default:
        return 'default'
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 rounded-xl shadow-xl overflow-hidden"
      style={{
        width: displayWidth,
        height: displayHeight,
        cursor: getCursor(),
      }}
    >
      <Stage
        ref={stageRef}
        width={displayWidth}
        height={displayHeight}
        scaleX={effectiveScale}
        scaleY={effectiveScale}
        x={stagePadding + canvas.panX}
        y={stagePadding + canvas.panY}
        onClick={handleStageClick}
        onDblClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Pitch background layer - static, rarely redraws */}
        <PitchLayer
          width={nativeWidth}
          height={nativeHeight}
          theme={canvas.pitchTheme}
          view={canvas.pitchView}
          showGrid={canvas.showGrid}
          gridSize={canvas.gridSize}
        />

        {/* Drawings layer */}
        <DrawingsLayer />

        {/* Equipment layer */}
        <EquipmentLayer />

        {/* Players layer - interactive */}
        <PlayersLayer />

        {/* Ball layer */}
        <Layer>
          <BallComponent />
        </Layer>
      </Stage>
    </div>
  )
})
