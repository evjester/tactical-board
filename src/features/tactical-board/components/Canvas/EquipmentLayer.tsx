import { useRef, useState } from 'react'
import { Layer, Group, Circle, Line, Rect, RegularPolygon } from 'react-konva'
import type Konva from 'konva'
import { useTacticalBoardStore, useEquipment, useLayersState, useCanvasState } from '../../store'
import type { Equipment, ConeColor } from '../../types'

// Rotation handle component that appears when equipment is selected
interface RotationHandleProps {
  offsetY: number
  viewScale: number
  itemId: string
  locked: boolean
}

function RotationHandle({ offsetY, viewScale, itemId, locked }: RotationHandleProps) {
  const { rotateEquipment } = useTacticalBoardStore()
  const isDraggingRef = useRef(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleSize = 8 * viewScale
  const lineLength = 25 * viewScale

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    isDraggingRef.current = true
  }

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isDraggingRef.current || locked) return
    e.cancelBubble = true

    const stage = e.target.getStage()
    if (!stage) return

    const group = e.target.getParent()?.getParent()
    if (!group) return

    // Get the absolute position of the equipment center
    const groupPos = group.getAbsolutePosition()

    // Get pointer position
    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return

    // Calculate angle from equipment center to pointer
    const dx = pointerPos.x - groupPos.x
    const dy = pointerPos.y - groupPos.y
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90 // +90 because 0 degrees is up

    rotateEquipment(itemId, angle)

    // Reset handle position back to its offset (the rotation is applied to the parent group)
    e.target.position({ x: 0, y: offsetY - lineLength })
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    isDraggingRef.current = false
    // Reset position
    e.target.position({ x: 0, y: offsetY - lineLength })
  }

  return (
    <Group>
      {/* Connecting line from equipment to handle */}
      <Line
        points={[0, offsetY, 0, offsetY - lineLength]}
        stroke={isHovered ? '#3b82f6' : '#6b7280'}
        strokeWidth={2 * viewScale}
        dash={[4 * viewScale, 2 * viewScale]}
      />
      {/* Rotation handle circle */}
      <Circle
        x={0}
        y={offsetY - lineLength}
        radius={handleSize}
        fill={isHovered ? '#3b82f6' : '#6b7280'}
        stroke="#ffffff"
        strokeWidth={2 * viewScale}
        draggable={!locked}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        shadowColor="black"
        shadowBlur={3}
        shadowOpacity={0.3}
        style={{ cursor: 'grab' }}
      />
      {/* Rotation icon inside handle */}
      <Group x={0} y={offsetY - lineLength} listening={false}>
        <Line
          points={[
            -3 * viewScale, -2 * viewScale,
            3 * viewScale, -2 * viewScale,
            2 * viewScale, -4 * viewScale,
          ]}
          stroke="#ffffff"
          strokeWidth={1.5 * viewScale}
          lineCap="round"
          lineJoin="round"
        />
        <Line
          points={[
            3 * viewScale, 2 * viewScale,
            -3 * viewScale, 2 * viewScale,
            -2 * viewScale, 4 * viewScale,
          ]}
          stroke="#ffffff"
          strokeWidth={1.5 * viewScale}
          lineCap="round"
          lineJoin="round"
        />
      </Group>
    </Group>
  )
}

// Color mapping for cones
const CONE_COLORS: Record<ConeColor, { fill: string; stroke: string }> = {
  red: { fill: '#ef4444', stroke: '#b91c1c' },
  yellow: { fill: '#eab308', stroke: '#a16207' },
  orange: { fill: '#f97316', stroke: '#c2410c' },
  blue: { fill: '#3b82f6', stroke: '#1d4ed8' },
  green: { fill: '#22c55e', stroke: '#15803d' },
  white: { fill: '#ffffff', stroke: '#9ca3af' },
}

// Tools that should allow clicks to pass through equipment (drawing tools)
const DRAWING_TOOLS = [
  'line', 'arrow', 'dottedArrow', 'dashedArrow', 'curve', 'curvedArrow',
  'freehand', 'rectangle', 'ellipse', 'triangle', 'text',
  'zone', 'freehandZone', 'offsideLine', 'measurement', 'pressingTrigger',
  'playerRun', 'passingLane', 'defensiveLine', 'highlighter', 'sprayArrows',
  'movementArrow'
]

interface EquipmentItemProps {
  item: Equipment
  locked: boolean
  viewScale: number
}

function ConeItem({ item, locked, viewScale }: EquipmentItemProps) {
  const { selectEquipment, moveEquipment, setEquipmentDragging } = useTacticalBoardStore()
  const activeTool = useTacticalBoardStore((state) => state.ui.activeTool)

  const colors = CONE_COLORS[item.color ?? 'orange']
  const isDrawingTool = DRAWING_TOOLS.includes(activeTool)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (locked) return
    if (activeTool === 'select') {
      selectEquipment(item.id, e.evt.shiftKey)
    }
  }

  const handleDragStart = () => {
    if (locked) return
    setEquipmentDragging(item.id, true)
  }

  // Sync position to store only on drag end for smooth performance
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (locked) return
    const node = e.target
    moveEquipment(item.id, node.x(), node.y())
    setEquipmentDragging(item.id, false)
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable={activeTool === 'select' && !locked}
      listening={!isDrawingTool}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection highlight */}
      {item.isSelected && (
        <Circle
          x={0}
          y={0}
          radius={16 * viewScale}
          stroke="#ffffff"
          strokeWidth={2}
          dash={[5 * viewScale, 3 * viewScale]}
          fill="transparent"
        />
      )}
      {/* Cone shape - triangle with rounded base */}
      <RegularPolygon
        x={0}
        y={0}
        sides={3}
        radius={12 * viewScale}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={2 * viewScale}
        shadowColor="black"
        shadowBlur={3 * viewScale}
        shadowOffset={{ x: 1 * viewScale, y: 1 * viewScale }}
        shadowOpacity={0.3}
      />
      {/* White stripe */}
      <Line
        points={[-4 * viewScale, 3 * viewScale, 4 * viewScale, 3 * viewScale]}
        stroke="white"
        strokeWidth={2 * viewScale}
        lineCap="round"
      />
      {/* Rotation handle when selected */}
      {item.isSelected && (
        <RotationHandle
          offsetY={-16 * viewScale}
          viewScale={viewScale}
          itemId={item.id}
          locked={locked}
        />
      )}
    </Group>
  )
}

function MannequinItem({ item, locked, viewScale }: EquipmentItemProps) {
  const { selectEquipment, moveEquipment, setEquipmentDragging } = useTacticalBoardStore()
  const activeTool = useTacticalBoardStore((state) => state.ui.activeTool)

  const isTall = item.height === 'tall'
  const bodyHeight = (isTall ? 40 : 28) * viewScale
  const headRadius = (isTall ? 8 : 6) * viewScale
  const isDrawingTool = DRAWING_TOOLS.includes(activeTool)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (locked) return
    if (activeTool === 'select') {
      selectEquipment(item.id, e.evt.shiftKey)
    }
  }

  const handleDragStart = () => {
    if (locked) return
    setEquipmentDragging(item.id, true)
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (locked) return
    const node = e.target
    moveEquipment(item.id, node.x(), node.y())
    setEquipmentDragging(item.id, false)
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable={activeTool === 'select' && !locked}
      listening={!isDrawingTool}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection highlight */}
      {item.isSelected && (
        <Circle
          x={0}
          y={-bodyHeight / 2 - headRadius}
          radius={headRadius + 6 * viewScale}
          stroke="#ffffff"
          strokeWidth={2}
          dash={[5 * viewScale, 3 * viewScale]}
          fill="transparent"
        />
      )}
      {/* Base */}
      <Circle
        x={0}
        y={bodyHeight / 2}
        radius={12 * viewScale}
        fill="#4b5563"
        stroke="#374151"
        strokeWidth={1}
      />
      {/* Body - elongated shape */}
      <Rect
        x={-6 * viewScale}
        y={-bodyHeight / 2}
        width={12 * viewScale}
        height={bodyHeight}
        fill="#2563eb"
        stroke="#1d4ed8"
        strokeWidth={1}
        cornerRadius={4 * viewScale}
        shadowColor="black"
        shadowBlur={3 * viewScale}
        shadowOffset={{ x: 1 * viewScale, y: 1 * viewScale }}
        shadowOpacity={0.3}
      />
      {/* Head */}
      <Circle
        x={0}
        y={-bodyHeight / 2 - headRadius}
        radius={headRadius}
        fill="#f5d0c5"
        stroke="#d4a59a"
        strokeWidth={1}
      />
      {/* Rotation handle when selected */}
      {item.isSelected && (
        <RotationHandle
          offsetY={-bodyHeight / 2 - headRadius * 2 - 6 * viewScale}
          viewScale={viewScale}
          itemId={item.id}
          locked={locked}
        />
      )}
    </Group>
  )
}

function PoleItem({ item, locked, viewScale }: EquipmentItemProps) {
  const { selectEquipment, moveEquipment, setEquipmentDragging } = useTacticalBoardStore()
  const activeTool = useTacticalBoardStore((state) => state.ui.activeTool)

  const isTall = item.height === 'tall'
  const poleHeight = (isTall ? 50 : 30) * viewScale
  const isDrawingTool = DRAWING_TOOLS.includes(activeTool)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (locked) return
    if (activeTool === 'select') {
      selectEquipment(item.id, e.evt.shiftKey)
    }
  }

  const handleDragStart = () => {
    if (locked) return
    setEquipmentDragging(item.id, true)
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (locked) return
    const node = e.target
    moveEquipment(item.id, node.x(), node.y())
    setEquipmentDragging(item.id, false)
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable={activeTool === 'select' && !locked}
      listening={!isDrawingTool}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection highlight */}
      {item.isSelected && (
        <Circle
          x={0}
          y={-poleHeight / 2}
          radius={10 * viewScale}
          stroke="#ffffff"
          strokeWidth={2}
          dash={[5 * viewScale, 3 * viewScale]}
          fill="transparent"
        />
      )}
      {/* Base */}
      <Circle
        x={0}
        y={poleHeight / 2}
        radius={8 * viewScale}
        fill="#4b5563"
        stroke="#374151"
        strokeWidth={1}
      />
      {/* Pole */}
      <Rect
        x={-3 * viewScale}
        y={-poleHeight / 2}
        width={6 * viewScale}
        height={poleHeight}
        fill="#f97316"
        stroke="#c2410c"
        strokeWidth={1}
        cornerRadius={2 * viewScale}
        shadowColor="black"
        shadowBlur={3 * viewScale}
        shadowOffset={{ x: 1 * viewScale, y: 1 * viewScale }}
        shadowOpacity={0.3}
      />
      {/* Rotation handle when selected */}
      {item.isSelected && (
        <RotationHandle
          offsetY={-poleHeight / 2 - 6 * viewScale}
          viewScale={viewScale}
          itemId={item.id}
          locked={locked}
        />
      )}
    </Group>
  )
}

function LadderItem({ item, locked, viewScale }: EquipmentItemProps) {
  const { selectEquipment, moveEquipment, setEquipmentDragging } = useTacticalBoardStore()
  const activeTool = useTacticalBoardStore((state) => state.ui.activeTool)

  const ladderWidth = 30 * viewScale
  const ladderLength = 60 * viewScale
  const rungCount = 5
  const isDrawingTool = DRAWING_TOOLS.includes(activeTool)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (locked) return
    if (activeTool === 'select') {
      selectEquipment(item.id, e.evt.shiftKey)
    }
  }

  const handleDragStart = () => {
    if (locked) return
    setEquipmentDragging(item.id, true)
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (locked) return
    const node = e.target
    moveEquipment(item.id, node.x(), node.y())
    setEquipmentDragging(item.id, false)
  }

  const rungs = []
  const rungSpacing = ladderLength / (rungCount + 1)
  for (let i = 1; i <= rungCount; i++) {
    rungs.push(
      <Line
        key={i}
        points={[-ladderWidth / 2, -ladderLength / 2 + i * rungSpacing, ladderWidth / 2, -ladderLength / 2 + i * rungSpacing]}
        stroke="#eab308"
        strokeWidth={3 * viewScale}
        lineCap="round"
      />
    )
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable={activeTool === 'select' && !locked}
      listening={!isDrawingTool}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection highlight */}
      {item.isSelected && (
        <Rect
          x={-ladderWidth / 2 - 4 * viewScale}
          y={-ladderLength / 2 - 4 * viewScale}
          width={ladderWidth + 8 * viewScale}
          height={ladderLength + 8 * viewScale}
          stroke="#ffffff"
          strokeWidth={2}
          dash={[5 * viewScale, 3 * viewScale]}
          fill="transparent"
        />
      )}
      {/* Side rails */}
      <Line
        points={[-ladderWidth / 2, -ladderLength / 2, -ladderWidth / 2, ladderLength / 2]}
        stroke="#eab308"
        strokeWidth={4 * viewScale}
        lineCap="round"
      />
      <Line
        points={[ladderWidth / 2, -ladderLength / 2, ladderWidth / 2, ladderLength / 2]}
        stroke="#eab308"
        strokeWidth={4 * viewScale}
        lineCap="round"
      />
      {/* Rungs */}
      {rungs}
      {/* Rotation handle when selected */}
      {item.isSelected && (
        <RotationHandle
          offsetY={-ladderLength / 2 - 6 * viewScale}
          viewScale={viewScale}
          itemId={item.id}
          locked={locked}
        />
      )}
    </Group>
  )
}

function HurdleItem({ item, locked, viewScale }: EquipmentItemProps) {
  const { selectEquipment, moveEquipment, setEquipmentDragging } = useTacticalBoardStore()
  const activeTool = useTacticalBoardStore((state) => state.ui.activeTool)

  const hurdleWidth = 40 * viewScale
  const hurdleHeight = 20 * viewScale
  const isDrawingTool = DRAWING_TOOLS.includes(activeTool)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (locked) return
    if (activeTool === 'select') {
      selectEquipment(item.id, e.evt.shiftKey)
    }
  }

  const handleDragStart = () => {
    if (locked) return
    setEquipmentDragging(item.id, true)
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (locked) return
    const node = e.target
    moveEquipment(item.id, node.x(), node.y())
    setEquipmentDragging(item.id, false)
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable={activeTool === 'select' && !locked}
      listening={!isDrawingTool}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection highlight */}
      {item.isSelected && (
        <Rect
          x={-hurdleWidth / 2 - 4 * viewScale}
          y={-hurdleHeight - 4 * viewScale}
          width={hurdleWidth + 8 * viewScale}
          height={hurdleHeight + 8 * viewScale}
          stroke="#ffffff"
          strokeWidth={2}
          dash={[5 * viewScale, 3 * viewScale]}
          fill="transparent"
        />
      )}
      {/* Left leg */}
      <Line
        points={[-hurdleWidth / 2, 0, -hurdleWidth / 2, -hurdleHeight]}
        stroke="#f97316"
        strokeWidth={4 * viewScale}
        lineCap="round"
      />
      {/* Right leg */}
      <Line
        points={[hurdleWidth / 2, 0, hurdleWidth / 2, -hurdleHeight]}
        stroke="#f97316"
        strokeWidth={4 * viewScale}
        lineCap="round"
      />
      {/* Top bar */}
      <Line
        points={[-hurdleWidth / 2, -hurdleHeight, hurdleWidth / 2, -hurdleHeight]}
        stroke="#f97316"
        strokeWidth={5 * viewScale}
        lineCap="round"
      />
      {/* Rotation handle when selected */}
      {item.isSelected && (
        <RotationHandle
          offsetY={-hurdleHeight - 6 * viewScale}
          viewScale={viewScale}
          itemId={item.id}
          locked={locked}
        />
      )}
    </Group>
  )
}

function EquipmentItem({ item, locked, viewScale }: EquipmentItemProps) {
  switch (item.type) {
    case 'cone':
      return <ConeItem item={item} locked={locked} viewScale={viewScale} />
    case 'mannequin':
      return <MannequinItem item={item} locked={locked} viewScale={viewScale} />
    case 'pole':
      return <PoleItem item={item} locked={locked} viewScale={viewScale} />
    case 'ladder':
      return <LadderItem item={item} locked={locked} viewScale={viewScale} />
    case 'hurdle':
      return <HurdleItem item={item} locked={locked} viewScale={viewScale} />
    default:
      return null
  }
}

export function EquipmentLayer() {
  const equipment = useEquipment()
  const layers = useLayersState()
  const canvas = useCanvasState()

  // Don't render if layer is hidden
  if (!layers.equipment.visible) return null

  const isLocked = layers.equipment.locked

  // Scale factor for half view (smaller equipment)
  const viewScale = canvas.pitchView === 'half' ? 0.7 : 1

  // Sort equipment: non-selected first, then selected, so selected are on top
  const sortedEquipment = [...equipment].sort((a, b) => {
    if (a.isSelected === b.isSelected) return 0
    return a.isSelected ? 1 : -1
  })

  return (
    <Layer>
      {sortedEquipment.map((item) => (
        <EquipmentItem key={item.id} item={item} locked={isLocked} viewScale={viewScale} />
      ))}
    </Layer>
  )
}
