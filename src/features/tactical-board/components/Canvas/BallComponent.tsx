import { Group, Circle } from 'react-konva'
import type Konva from 'konva'
import { useTacticalBoardStore, useBall, useLayersState, useCanvasState } from '../../store'

// Tools that should allow clicks to pass through the ball (drawing tools)
const DRAWING_TOOLS = [
  'line', 'arrow', 'dottedArrow', 'dashedArrow', 'curve', 'curvedArrow',
  'freehand', 'rectangle', 'ellipse', 'triangle', 'text',
  'zone', 'freehandZone', 'offsideLine', 'measurement', 'pressingTrigger',
  'playerRun', 'passingLane', 'defensiveLine', 'highlighter', 'sprayArrows',
  'movementArrow'
]

export function BallComponent() {
  const ball = useBall()
  const layers = useLayersState()
  const canvas = useCanvasState()
  const { selectBall, moveBall } = useTacticalBoardStore()
  const activeTool = useTacticalBoardStore((state) => state.ui.activeTool)

  // Don't render if ball doesn't exist or layer is hidden
  if (!ball || !layers.ball.visible) return null

  const isLocked = layers.ball.locked
  const isDrawingTool = DRAWING_TOOLS.includes(activeTool)

  // Scale factor for half view (smaller ball)
  const viewScale = canvas.pitchView === 'half' ? 0.7 : 1

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (isLocked) return
    if (activeTool === 'select') {
      selectBall()
    }
  }

  // Sync position to store only on drag end for smooth performance
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (isLocked) return
    const node = e.target
    moveBall(node.x(), node.y())
  }

  return (
    <Group
      x={ball.x}
      y={ball.y}
      draggable={activeTool === 'select' && !isLocked}
      listening={!isDrawingTool}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection highlight */}
      {ball.isSelected && (
        <Circle
          x={0}
          y={0}
          radius={18 * viewScale}
          stroke="#ffffff"
          strokeWidth={2}
          dash={[5 * viewScale, 3 * viewScale]}
          fill="transparent"
        />
      )}

      {/* Ball outer */}
      <Circle
        x={0}
        y={0}
        radius={12 * viewScale}
        fill="#ffffff"
        stroke="#333333"
        strokeWidth={2 * viewScale}
        shadowColor="black"
        shadowBlur={5 * viewScale}
        shadowOffset={{ x: 2 * viewScale, y: 2 * viewScale }}
        shadowOpacity={0.3}
      />

      {/* Ball pentagon pattern (simplified) */}
      <Circle x={0} y={0} radius={5 * viewScale} fill="#333333" />
      <Circle x={-6 * viewScale} y={-4 * viewScale} radius={3 * viewScale} fill="#333333" />
      <Circle x={6 * viewScale} y={-4 * viewScale} radius={3 * viewScale} fill="#333333" />
      <Circle x={-4 * viewScale} y={6 * viewScale} radius={3 * viewScale} fill="#333333" />
      <Circle x={4 * viewScale} y={6 * viewScale} radius={3 * viewScale} fill="#333333" />
    </Group>
  )
}
