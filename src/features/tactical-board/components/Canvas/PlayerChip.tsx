import { useRef } from 'react'
import { Group, Circle, Text, Arrow } from 'react-konva'
import type Konva from 'konva'
import type { Player } from '../../types'
import { useTacticalBoardStore, useCanvasState } from '../../store'

interface PlayerChipProps {
  player: Player
  locked?: boolean
}

export function PlayerChip({ player, locked = false }: PlayerChipProps) {
  const groupRef = useRef<Konva.Group>(null)

  const {
    selectPlayer,
    movePlayer,
    setPlayerDragging,
    setEditingPlayer,
  } = useTacticalBoardStore()

  const { activeTool } = useTacticalBoardStore((state) => state.ui)
  const canvas = useCanvasState()

  // Tools that should allow clicks to pass through players (drawing tools)
  const drawingTools = [
    'line', 'arrow', 'dottedArrow', 'dashedArrow', 'curve', 'curvedArrow',
    'freehand', 'rectangle', 'ellipse', 'triangle', 'text',
    'zone', 'freehandZone', 'offsideLine', 'measurement', 'pressingTrigger',
    'playerRun', 'passingLane', 'defensiveLine', 'highlighter', 'sprayArrows',
    'movementArrow'
  ]
  const isDrawingTool = drawingTools.includes(activeTool)

  // Scale factor for half view (smaller players)
  const viewScale = canvas.pitchView === 'half' ? 0.7 : 1

  // Size configuration (scaled for half view)
  const baseRadius = player.size === 'large' ? 20 : 14
  const baseFontSize = player.size === 'large' ? 14 : 10
  const baseStrokeWidth = player.size === 'large' ? 3 : 2

  const radius = baseRadius * viewScale
  const fontSize = baseFontSize * viewScale
  const strokeWidth = baseStrokeWidth * viewScale

  // Handle drag (disabled when locked)
  // Let Konva handle visual movement during drag for smooth performance
  // Only sync position to store on drag end
  const handleDragStart = () => {
    if (locked) return
    setPlayerDragging(player.id, true)
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (locked) return
    const node = e.target
    movePlayer(player.id, node.x(), node.y())
    setPlayerDragging(player.id, false)
  }

  // Handle click/select (disabled when locked)
  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true // Prevent stage click
    if (locked) return

    if (activeTool === 'select') {
      const multiSelect = e.evt.shiftKey || e.evt.metaKey
      selectPlayer(player.id, multiSelect)
    }
  }

  // Handle double-click to open edit dialog (disabled when locked)
  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (locked) return
    if (activeTool === 'select') {
      setEditingPlayer(player.id)
    }
  }

  // Movement arrow rendering
  const renderMovementArrow = () => {
    if (!player.movementArrow) return null

    const { direction, length } = player.movementArrow
    const radians = (direction - 90) * (Math.PI / 180) // Convert to radians, adjust for 0=up
    const scaledLength = length * viewScale
    const endX = Math.cos(radians) * scaledLength
    const endY = Math.sin(radians) * scaledLength

    return (
      <Arrow
        points={[0, 0, endX, endY]}
        stroke={player.primaryColor}
        strokeWidth={2 * viewScale}
        fill={player.primaryColor}
        pointerLength={8 * viewScale}
        pointerWidth={6 * viewScale}
        opacity={0.8}
      />
    )
  }

  return (
    <Group
      ref={groupRef}
      x={player.x}
      y={player.y}
      rotation={player.rotation}
      draggable={activeTool === 'select' && !locked}
      listening={!isDrawingTool}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      opacity={player.opacity ?? 1}
    >
      {/* Movement arrow (behind the chip) */}
      {renderMovementArrow()}

      {/* Selection highlight ring */}
      {player.isSelected && (
        <Circle
          x={0}
          y={0}
          radius={radius + 5}
          stroke="#ffffff"
          strokeWidth={2}
          dash={[5, 3]}
          fill="transparent"
        />
      )}

      {/* Outer circle (secondary color / border) */}
      <Circle
        x={0}
        y={0}
        radius={radius}
        fill={player.primaryColor}
        stroke={player.secondaryColor}
        strokeWidth={strokeWidth}
        shadowColor="black"
        shadowBlur={player.isDragging ? 10 : 5}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.3}
      />

      {/* Player number */}
      <Text
        x={-radius}
        y={-fontSize / 2 - 1}
        width={radius * 2}
        height={fontSize + 2}
        text={String(player.number)}
        fontSize={fontSize}
        fontStyle="bold"
        fontFamily="Arial, sans-serif"
        fill={player.secondaryColor}
        align="center"
        verticalAlign="middle"
      />

      {/* Player name (shown below chip when selected or large size) */}
      {(player.isSelected || player.size === 'large') && player.name && (
        <Text
          x={-50 * viewScale}
          y={radius + 4 * viewScale}
          width={100 * viewScale}
          text={player.name}
          fontSize={10 * viewScale}
          fontFamily="Arial, sans-serif"
          fill="#ffffff"
          align="center"
          shadowColor="black"
          shadowBlur={2}
          shadowOffset={{ x: 1, y: 1 }}
          shadowOpacity={0.8}
        />
      )}

      {/* Position code badge (when selected) */}
      {player.isSelected && player.positionCode && (
        <Group x={(radius - 5 * viewScale)} y={(-radius - 5 * viewScale)}>
          <Circle x={0} y={0} radius={10 * viewScale} fill="#333333" stroke="#ffffff" strokeWidth={1} />
          <Text
            x={-10 * viewScale}
            y={-5 * viewScale}
            width={20 * viewScale}
            height={10 * viewScale}
            text={player.positionCode}
            fontSize={7 * viewScale}
            fontStyle="bold"
            fontFamily="Arial, sans-serif"
            fill="#ffffff"
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}

      {/* Ghost effect for animation preview */}
      {player.isGhost && (
        <Circle
          x={0}
          y={0}
          radius={radius + 2 * viewScale}
          fill="transparent"
          stroke="#ffffff"
          strokeWidth={1}
          dash={[3 * viewScale, 3 * viewScale]}
          opacity={0.5}
        />
      )}
    </Group>
  )
}
