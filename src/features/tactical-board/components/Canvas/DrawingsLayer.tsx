import { Layer, Line, Arrow, Circle, Rect, Ellipse, Text, Group } from 'react-konva'
import type Konva from 'konva'
import { useDrawings, useActiveDrawing, useTacticalBoardStore, useCanvasState, useLayersState } from '../../store'
import { getPitchDimensions } from '../../constants'
import type {
  DrawingElement,
  LineDrawing,
  CurvedLineDrawing,
  FreehandDrawing,
  ShapeDrawing,
  TextDrawing,
  ZoneDrawing,
  FreehandZoneDrawing,
  OffsideLineDrawing,
  MeasurementDrawing,
  PressingTriggerDrawing,
  PlayerRunDrawing,
  PassingLaneDrawing,
  DefensiveLineDrawing,
  HighlighterDrawing,
  SprayArrowsDrawing,
} from '../../types'

export function DrawingsLayer() {
  const drawings = useDrawings()
  const activeDrawing = useActiveDrawing()
  const canvas = useCanvasState()
  const layers = useLayersState()
  const pitchDimensions = getPitchDimensions(canvas.pitchView)
  const { selectDrawing, removeDrawing } = useTacticalBoardStore()
  const activeTool = useTacticalBoardStore((state) => state.ui.activeTool)

  // Check if drawings layer is visible
  const isVisible = layers.drawings.visible
  const isLocked = layers.drawings.locked

  const handleDrawingClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, id: string) => {
    e.cancelBubble = true
    // Don't allow interaction if layer is locked
    if (isLocked) return
    if (activeTool === 'select') {
      const evt = e.evt as MouseEvent
      const multiSelect = evt.shiftKey || evt.metaKey
      selectDrawing(id, multiSelect)
    } else if (activeTool === 'eraser') {
      // Eraser tool removes the drawing on click
      removeDrawing(id)
    }
  }

  // Get dash pattern based on line style
  const getDash = (lineStyle: string, strokeWidth: number): number[] | undefined => {
    switch (lineStyle) {
      case 'dotted':
        return [strokeWidth, strokeWidth * 2]
      case 'dashed':
        return [strokeWidth * 3, strokeWidth * 2]
      default:
        return undefined
    }
  }

  // Render line drawing
  const renderLineDrawing = (drawing: LineDrawing) => {
    const dash = getDash(drawing.lineStyle, drawing.strokeWidth)
    const isArrow = drawing.arrowHead !== 'none'

    const commonProps = {
      key: drawing.id,
      points: drawing.points,
      stroke: drawing.color,
      strokeWidth: drawing.strokeWidth,
      opacity: drawing.opacity,
      dash,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id),
      onTap: (e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id),
      hitStrokeWidth: 20, // Easier to click
    }

    if (isArrow) {
      return (
        <Arrow
          {...commonProps}
          fill={drawing.color}
          pointerLength={drawing.strokeWidth * 4}
          pointerWidth={drawing.strokeWidth * 3}
        />
      )
    }

    return <Line {...commonProps} />
  }

  // Render curved line drawing
  const renderCurvedDrawing = (drawing: CurvedLineDrawing) => {
    const isArrow = drawing.arrowHead !== 'none'
    const points = drawing.points

    // For curved arrows, we need to draw the curve and arrowhead separately
    // because Konva's Arrow with tension doesn't calculate arrowhead direction correctly
    if (isArrow && points.length >= 6) {
      // Get the last two points (control point and end point) to calculate arrow direction
      const ctrlX = points[points.length - 4]
      const ctrlY = points[points.length - 3]
      const endX = points[points.length - 2]
      const endY = points[points.length - 1]

      // Calculate direction from control to end for arrowhead
      const dx = endX - ctrlX
      const dy = endY - ctrlY
      const len = Math.sqrt(dx * dx + dy * dy)
      const unitX = dx / len
      const unitY = dy / len

      // Arrow head size
      const pointerLength = drawing.strokeWidth * 4
      const arrowStartX = endX - unitX * pointerLength
      const arrowStartY = endY - unitY * pointerLength

      return (
        <Group key={drawing.id}>
          {/* The curved line */}
          <Line
            points={points}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
            onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
            hitStrokeWidth={20}
          />
          {/* The arrowhead - drawn as a short arrow from near the end to the end */}
          <Arrow
            points={[arrowStartX, arrowStartY, endX, endY]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            fill={drawing.color}
            opacity={drawing.opacity}
            pointerLength={pointerLength}
            pointerWidth={drawing.strokeWidth * 3}
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
            onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
            hitStrokeWidth={20}
          />
        </Group>
      )
    }

    // Regular curved line (no arrow)
    return (
      <Line
        key={drawing.id}
        points={points}
        stroke={drawing.color}
        strokeWidth={drawing.strokeWidth}
        opacity={drawing.opacity}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
        onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
        onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
        hitStrokeWidth={20}
      />
    )
  }

  // Render freehand drawing
  const renderFreehandDrawing = (drawing: FreehandDrawing) => (
    <Line
      key={drawing.id}
      points={drawing.points}
      stroke={drawing.color}
      strokeWidth={drawing.strokeWidth}
      opacity={drawing.opacity}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
      onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
      hitStrokeWidth={20}
    />
  )

  // Render shape drawing
  const renderShapeDrawing = (drawing: ShapeDrawing) => {
    const commonProps = {
      key: drawing.id,
      x: drawing.x,
      y: drawing.y,
      width: drawing.width,
      height: drawing.height,
      stroke: drawing.color,
      strokeWidth: drawing.strokeWidth,
      opacity: drawing.opacity,
      fill: drawing.fill || 'transparent',
      rotation: drawing.rotation,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id),
      onTap: (e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id),
    }

    switch (drawing.type) {
      case 'rectangle':
        return <Rect {...commonProps} />
      case 'ellipse':
        return (
          <Ellipse
            {...commonProps}
            x={drawing.x + drawing.width / 2}
            y={drawing.y + drawing.height / 2}
            radiusX={drawing.width / 2}
            radiusY={drawing.height / 2}
          />
        )
      case 'triangle':
        // Render triangle as a Line with closed path
        return (
          <Line
            key={drawing.id}
            points={[
              drawing.x + drawing.width / 2,
              drawing.y,
              drawing.x + drawing.width,
              drawing.y + drawing.height,
              drawing.x,
              drawing.y + drawing.height,
            ]}
            closed
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
            fill={drawing.fill || 'transparent'}
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
            onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
          />
        )
      default:
        return null
    }
  }

  // Render text drawing
  const renderTextDrawing = (drawing: TextDrawing) => (
    <Text
      key={drawing.id}
      x={drawing.x}
      y={drawing.y}
      text={drawing.text}
      fontSize={drawing.fontSize}
      fontFamily={drawing.fontFamily}
      fontStyle={drawing.fontStyle}
      fill={drawing.color}
      opacity={drawing.opacity}
      rotation={drawing.rotation}
      onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
      onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
    />
  )

  // Render zone (highlighted area)
  const renderZoneDrawing = (drawing: ZoneDrawing) => (
    <Line
      key={drawing.id}
      points={drawing.points}
      closed
      fill={drawing.fill}
      opacity={drawing.fillOpacity}
      stroke={drawing.color}
      strokeWidth={drawing.strokeWidth}
      onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
      onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
    />
  )

  // Render offside line (perpendicular to direction of play)
  // In vertical view: horizontal line at y position
  // In horizontal view: vertical line at x position (y becomes x)
  const renderOffsideLineDrawing = (drawing: OffsideLineDrawing) => {
    const isVerticalView = canvas.pitchView === 'vertical'

    if (isVerticalView) {
      // Vertical view: horizontal line across the pitch width
      return (
        <Group key={drawing.id}>
          <Line
            points={[0, drawing.y, pitchDimensions.width, drawing.y]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
            dash={[10, 5]}
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
            onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
            hitStrokeWidth={20}
          />
          {drawing.label && (
            <Text
              x={10}
              y={drawing.y - 20}
              text={drawing.label}
              fontSize={12}
              fill={drawing.color}
              opacity={drawing.opacity}
            />
          )}
        </Group>
      )
    } else {
      // Horizontal view: vertical line at x position (y becomes x)
      // The y value was captured in vertical view coordinates, scale it to horizontal x
      const x = drawing.y
      return (
        <Group key={drawing.id}>
          <Line
            points={[x, 0, x, pitchDimensions.height]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
            dash={[10, 5]}
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
            onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
            hitStrokeWidth={20}
          />
          {drawing.label && (
            <Text
              x={x + 5}
              y={10}
              text={drawing.label}
              fontSize={12}
              fill={drawing.color}
              opacity={drawing.opacity}
            />
          )}
        </Group>
      )
    }
  }

  // Render measurement line with distance
  const renderMeasurementDrawing = (drawing: MeasurementDrawing) => {
    const [x1, y1, x2, y2] = drawing.points
    const dx = x2 - x1
    const dy = y2 - y1
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Convert pixel distance to meters using the constant scale (1 meter = 10 pixels)
    // This is consistent regardless of view orientation
    const metersPerPixel = 0.1 // 1 pixel = 0.1 meters (PITCH.SCALE = 10)
    const distanceMeters = (distance * metersPerPixel).toFixed(1)
    const distanceYards = (distance * metersPerPixel * 1.0936).toFixed(1)
    const displayDistance = drawing.unit === 'meters' ? `${distanceMeters}m` : `${distanceYards}yd`

    // Calculate midpoint for label
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2

    return (
      <Group key={drawing.id}>
        {/* Main measurement line */}
        <Line
          points={[x1, y1, x2, y2]}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          opacity={drawing.opacity}
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
          onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
          hitStrokeWidth={20}
        />
        {/* End caps */}
        <Line
          points={[x1, y1 - 8, x1, y1 + 8]}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          opacity={drawing.opacity}
        />
        <Line
          points={[x2, y2 - 8, x2, y2 + 8]}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          opacity={drawing.opacity}
        />
        {/* Distance label */}
        {drawing.showDistance && (
          <Group x={midX} y={midY}>
            <Rect
              x={-25}
              y={-10}
              width={50}
              height={20}
              fill="white"
              opacity={0.9}
              cornerRadius={4}
            />
            <Text
              x={-25}
              y={-7}
              width={50}
              text={displayDistance}
              fontSize={12}
              fill={drawing.color}
              align="center"
            />
          </Group>
        )}
      </Group>
    )
  }

  // Render pressing trigger zone
  const renderPressingTriggerDrawing = (drawing: PressingTriggerDrawing) => {
    const triggerColors = {
      press: '#ef4444', // red
      cover: '#3b82f6', // blue
      mark: '#f59e0b', // amber
    }
    const triggerColor = triggerColors[drawing.triggerType] || drawing.color

    return (
      <Group key={drawing.id}>
        {/* Outer dashed circle */}
        <Circle
          x={drawing.x}
          y={drawing.y}
          radius={drawing.radius}
          stroke={triggerColor}
          strokeWidth={drawing.strokeWidth}
          opacity={drawing.opacity * 0.8}
          dash={[8, 4]}
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
          onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
        />
        {/* Fill */}
        <Circle
          x={drawing.x}
          y={drawing.y}
          radius={drawing.radius}
          fill={triggerColor}
          opacity={drawing.opacity * 0.15}
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
          onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
        />
        {/* Center indicator */}
        <Circle
          x={drawing.x}
          y={drawing.y}
          radius={6}
          fill={triggerColor}
          opacity={drawing.opacity}
        />
        {/* Label */}
        <Text
          x={drawing.x - 20}
          y={drawing.y + drawing.radius + 5}
          width={40}
          text={drawing.triggerType.toUpperCase()}
          fontSize={10}
          fill={triggerColor}
          align="center"
          fontStyle="bold"
        />
      </Group>
    )
  }

  // Render freehand zone (closed freehand shape with fill)
  const renderFreehandZoneDrawing = (drawing: FreehandZoneDrawing) => (
    <Line
      key={drawing.id}
      points={drawing.points}
      closed
      fill={drawing.fill}
      opacity={drawing.fillOpacity}
      stroke={drawing.color}
      strokeWidth={drawing.strokeWidth}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
      onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
    />
  )

  // Render player run (curved freehand path with arrow)
  const renderPlayerRunDrawing = (drawing: PlayerRunDrawing) => {
    const points = drawing.points
    if (points.length < 4) return null

    // Get direction for arrow at the end
    const lastX = points[points.length - 2]
    const lastY = points[points.length - 1]
    const prevX = points[points.length - 4] || points[0]
    const prevY = points[points.length - 3] || points[1]

    const dx = lastX - prevX
    const dy = lastY - prevY
    const len = Math.sqrt(dx * dx + dy * dy)
    const unitX = len > 0 ? dx / len : 1
    const unitY = len > 0 ? dy / len : 0
    const pointerLength = drawing.strokeWidth * 4
    const arrowStartX = lastX - unitX * pointerLength
    const arrowStartY = lastY - unitY * pointerLength

    return (
      <Group key={drawing.id}>
        {/* Dotted trail line */}
        <Line
          points={points}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          opacity={drawing.opacity}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          dash={[drawing.strokeWidth * 2, drawing.strokeWidth]}
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
          onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
          hitStrokeWidth={20}
        />
        {/* Arrow head at end */}
        <Arrow
          points={[arrowStartX, arrowStartY, lastX, lastY]}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          fill={drawing.color}
          opacity={drawing.opacity}
          pointerLength={pointerLength}
          pointerWidth={drawing.strokeWidth * 3}
        />
      </Group>
    )
  }

  // Render passing lane (dashed line showing passing option)
  const renderPassingLaneDrawing = (drawing: PassingLaneDrawing) => {
    const dash = drawing.lineStyle === 'dotted'
      ? [drawing.strokeWidth, drawing.strokeWidth * 2]
      : [drawing.strokeWidth * 3, drawing.strokeWidth * 2]

    return (
      <Line
        key={drawing.id}
        points={drawing.points}
        stroke={drawing.color}
        strokeWidth={drawing.strokeWidth}
        opacity={drawing.opacity}
        dash={dash}
        lineCap="round"
        onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
        onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
        hitStrokeWidth={20}
      />
    )
  }

  // Render defensive line (perpendicular to direction of play)
  // In vertical view: horizontal line segment
  // In horizontal view: vertical line segment
  const renderDefensiveLineDrawing = (drawing: DefensiveLineDrawing) => {
    const isVerticalView = canvas.pitchView === 'vertical'

    if (isVerticalView) {
      // Vertical view: horizontal line
      return (
        <Group key={drawing.id}>
          <Line
            points={[drawing.startX, drawing.y, drawing.endX, drawing.y]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth * 2}
            opacity={drawing.opacity}
            lineCap="round"
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
            onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
            hitStrokeWidth={20}
          />
          {/* Small vertical end caps */}
          <Line
            points={[drawing.startX, drawing.y - 10, drawing.startX, drawing.y + 10]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
          />
          <Line
            points={[drawing.endX, drawing.y - 10, drawing.endX, drawing.y + 10]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
          />
        </Group>
      )
    } else {
      // Horizontal view: vertical line (y becomes x, startX/endX become startY/endY)
      const x = drawing.y
      const startY = drawing.startX
      const endY = drawing.endX
      return (
        <Group key={drawing.id}>
          <Line
            points={[x, startY, x, endY]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth * 2}
            opacity={drawing.opacity}
            lineCap="round"
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
            onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
            hitStrokeWidth={20}
          />
          {/* Small horizontal end caps */}
          <Line
            points={[x - 10, startY, x + 10, startY]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
          />
          <Line
            points={[x - 10, endY, x + 10, endY]}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth}
            opacity={drawing.opacity}
          />
        </Group>
      )
    }
  }

  // Render highlighter (semi-transparent wide freehand stroke)
  const renderHighlighterDrawing = (drawing: HighlighterDrawing) => (
    <Line
      key={drawing.id}
      points={drawing.points}
      stroke={drawing.color}
      strokeWidth={drawing.strokeWidth}
      opacity={drawing.opacity}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation="multiply"
      onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
      onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
      hitStrokeWidth={drawing.strokeWidth + 10}
    />
  )

  // Render spray arrows (multiple arrows from one origin)
  const renderSprayArrowsDrawing = (drawing: SprayArrowsDrawing) => (
    <Group key={drawing.id}>
      {drawing.endpoints.map((endpoint, index) => (
        <Arrow
          key={`${drawing.id}-${index}`}
          points={[drawing.originX, drawing.originY, endpoint.x, endpoint.y]}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          fill={drawing.color}
          opacity={drawing.opacity}
          pointerLength={drawing.strokeWidth * 4}
          pointerWidth={drawing.strokeWidth * 3}
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleDrawingClick(e, drawing.id)}
          onTap={(e: Konva.KonvaEventObject<TouchEvent>) => handleDrawingClick(e, drawing.id)}
          hitStrokeWidth={20}
        />
      ))}
    </Group>
  )

  // Render selection indicator for selected drawings
  const renderSelectionIndicator = (drawing: DrawingElement) => {
    if (!drawing.isSelected) return null

    // For line drawings, draw circles at endpoints
    if (
      drawing.type === 'line' ||
      drawing.type === 'arrow' ||
      drawing.type === 'dottedLine' ||
      drawing.type === 'dottedArrow' ||
      drawing.type === 'dashedLine' ||
      drawing.type === 'dashedArrow'
    ) {
      const points = (drawing as LineDrawing).points
      return (
        <>
          <Circle
            x={points[0]}
            y={points[1]}
            radius={6}
            fill="#ffffff"
            stroke="#3b82f6"
            strokeWidth={2}
          />
          <Circle
            x={points[2]}
            y={points[3]}
            radius={6}
            fill="#ffffff"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </>
      )
    }

    // For shapes, draw corner handles
    if (drawing.type === 'rectangle' || drawing.type === 'ellipse' || drawing.type === 'triangle') {
      const shape = drawing as ShapeDrawing
      const corners = [
        { x: shape.x, y: shape.y },
        { x: shape.x + shape.width, y: shape.y },
        { x: shape.x + shape.width, y: shape.y + shape.height },
        { x: shape.x, y: shape.y + shape.height },
      ]

      return (
        <>
          {/* Selection box */}
          <Rect
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            stroke="#3b82f6"
            strokeWidth={1}
            dash={[4, 4]}
            fill="transparent"
          />
          {/* Corner handles */}
          {corners.map((corner, index) => (
            <Rect
              key={`corner-${index}`}
              x={corner.x - 4}
              y={corner.y - 4}
              width={8}
              height={8}
              fill="#ffffff"
              stroke="#3b82f6"
              strokeWidth={1}
            />
          ))}
        </>
      )
    }

    return null
  }

  // Render drawing based on type
  const renderDrawing = (drawing: DrawingElement) => {
    switch (drawing.type) {
      case 'line':
      case 'arrow':
      case 'dottedLine':
      case 'dottedArrow':
      case 'dashedLine':
      case 'dashedArrow':
        return renderLineDrawing(drawing as LineDrawing)
      case 'curve':
      case 'curvedArrow':
        return renderCurvedDrawing(drawing as CurvedLineDrawing)
      case 'freehand':
        return renderFreehandDrawing(drawing as FreehandDrawing)
      case 'rectangle':
      case 'ellipse':
      case 'triangle':
        return renderShapeDrawing(drawing as ShapeDrawing)
      case 'text':
        return renderTextDrawing(drawing as TextDrawing)
      case 'zone':
        return renderZoneDrawing(drawing as ZoneDrawing)
      case 'freehandZone':
        return renderFreehandZoneDrawing(drawing as FreehandZoneDrawing)
      case 'offsideLine':
        return renderOffsideLineDrawing(drawing as OffsideLineDrawing)
      case 'measurement':
        return renderMeasurementDrawing(drawing as MeasurementDrawing)
      case 'pressingTrigger':
        return renderPressingTriggerDrawing(drawing as PressingTriggerDrawing)
      case 'playerRun':
        return renderPlayerRunDrawing(drawing as PlayerRunDrawing)
      case 'passingLane':
        return renderPassingLaneDrawing(drawing as PassingLaneDrawing)
      case 'defensiveLine':
        return renderDefensiveLineDrawing(drawing as DefensiveLineDrawing)
      case 'highlighter':
        return renderHighlighterDrawing(drawing as HighlighterDrawing)
      case 'sprayArrows':
        return renderSprayArrowsDrawing(drawing as SprayArrowsDrawing)
      default:
        return null
    }
  }

  // Render active drawing (currently being drawn)
  const renderActiveDrawing = () => {
    if (!activeDrawing || activeDrawing.points.length < 2) return null

    const dash = getDash(activeDrawing.lineStyle, activeDrawing.strokeWidth)
    const isArrow = activeDrawing.arrowHead !== 'none'

    // Zone polygon preview
    if (activeDrawing.type === 'zone') {
      const points = activeDrawing.points
      const firstX = points[0]
      const firstY = points[1]

      return (
        <Group listening={false}>
          {/* Draw the polygon outline */}
          <Line
            points={points}
            stroke={activeDrawing.color}
            strokeWidth={activeDrawing.strokeWidth}
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />
          {/* Show semi-transparent fill preview when we have at least 3 points */}
          {points.length >= 6 && (
            <Line
              points={points}
              closed
              fill={activeDrawing.color}
              opacity={0.2}
              stroke="transparent"
            />
          )}
          {/* Closing line preview from last point back to first (dashed) */}
          {points.length >= 4 && (
            <Line
              points={[points[points.length - 2], points[points.length - 1], firstX, firstY]}
              stroke={activeDrawing.color}
              strokeWidth={activeDrawing.strokeWidth}
              opacity={0.4}
              dash={[8, 4]}
            />
          )}
          {/* Circle at first point to indicate close target */}
          {points.length >= 6 && (
            <Circle
              x={firstX}
              y={firstY}
              radius={12}
              stroke={activeDrawing.color}
              strokeWidth={2}
              fill={activeDrawing.color}
              opacity={0.3}
            />
          )}
          {/* Small circles at each vertex */}
          {Array.from({ length: Math.floor(points.length / 2) }).map((_, i) => (
            <Circle
              key={i}
              x={points[i * 2]}
              y={points[i * 2 + 1]}
              radius={4}
              fill={activeDrawing.color}
              opacity={0.8}
            />
          ))}
          {/* Instructions text */}
          {points.length >= 2 && points.length < 6 && (
            <Text
              x={points[points.length - 2] + 10}
              y={points[points.length - 1] - 20}
              text="Click to add points"
              fontSize={12}
              fill={activeDrawing.color}
              opacity={0.8}
            />
          )}
          {points.length >= 6 && (
            <Text
              x={firstX + 15}
              y={firstY - 10}
              text="Click here or double-click to close"
              fontSize={11}
              fill={activeDrawing.color}
              opacity={0.8}
            />
          )}
        </Group>
      )
    }

    if (activeDrawing.type === 'freehand') {
      return (
        <Line
          points={activeDrawing.points}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          opacity={0.8}
        />
      )
    }

    // Freehand zone preview - shows closed shape with fill
    if (activeDrawing.type === 'freehandZone') {
      return (
        <Line
          points={activeDrawing.points}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          closed
          fill={activeDrawing.color}
          opacity={0.3}
        />
      )
    }

    // Highlighter preview - wide semi-transparent stroke
    if (activeDrawing.type === 'highlighter') {
      return (
        <Line
          points={activeDrawing.points}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          opacity={0.4}
        />
      )
    }

    // Player run preview - dotted path with arrow at end
    if (activeDrawing.type === 'playerRun') {
      const points = activeDrawing.points
      if (points.length >= 4) {
        const lastX = points[points.length - 2]
        const lastY = points[points.length - 1]
        const prevX = points[points.length - 4] || points[0]
        const prevY = points[points.length - 3] || points[1]
        const dx = lastX - prevX
        const dy = lastY - prevY
        const len = Math.sqrt(dx * dx + dy * dy)
        const unitX = len > 0 ? dx / len : 1
        const unitY = len > 0 ? dy / len : 0
        const pointerLength = activeDrawing.strokeWidth * 4
        const arrowStartX = lastX - unitX * pointerLength
        const arrowStartY = lastY - unitY * pointerLength

        return (
          <Group>
            <Line
              points={points}
              stroke={activeDrawing.color}
              strokeWidth={activeDrawing.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              dash={[activeDrawing.strokeWidth * 2, activeDrawing.strokeWidth]}
              opacity={0.8}
            />
            <Arrow
              points={[arrowStartX, arrowStartY, lastX, lastY]}
              stroke={activeDrawing.color}
              strokeWidth={activeDrawing.strokeWidth}
              fill={activeDrawing.color}
              opacity={0.8}
              pointerLength={pointerLength}
              pointerWidth={activeDrawing.strokeWidth * 3}
            />
          </Group>
        )
      }
      return (
        <Line
          points={points}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          tension={0.5}
          dash={[activeDrawing.strokeWidth * 2, activeDrawing.strokeWidth]}
          opacity={0.8}
        />
      )
    }

    if (activeDrawing.type === 'rectangle') {
      const x = Math.min(activeDrawing.points[0], activeDrawing.points[2])
      const y = Math.min(activeDrawing.points[1], activeDrawing.points[3])
      const width = Math.abs(activeDrawing.points[2] - activeDrawing.points[0])
      const height = Math.abs(activeDrawing.points[3] - activeDrawing.points[1])

      return (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          fill="transparent"
          opacity={0.8}
        />
      )
    }

    if (activeDrawing.type === 'ellipse') {
      const x = Math.min(activeDrawing.points[0], activeDrawing.points[2])
      const y = Math.min(activeDrawing.points[1], activeDrawing.points[3])
      const width = Math.abs(activeDrawing.points[2] - activeDrawing.points[0])
      const height = Math.abs(activeDrawing.points[3] - activeDrawing.points[1])

      return (
        <Ellipse
          x={x + width / 2}
          y={y + height / 2}
          radiusX={width / 2}
          radiusY={height / 2}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          fill="transparent"
          opacity={0.8}
        />
      )
    }

    if (activeDrawing.type === 'triangle') {
      const x = Math.min(activeDrawing.points[0], activeDrawing.points[2])
      const y = Math.min(activeDrawing.points[1], activeDrawing.points[3])
      const width = Math.abs(activeDrawing.points[2] - activeDrawing.points[0])
      const height = Math.abs(activeDrawing.points[3] - activeDrawing.points[1])

      return (
        <Line
          points={[x + width / 2, y, x + width, y + height, x, y + height]}
          closed
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          fill="transparent"
          opacity={0.8}
        />
      )
    }

    // Curved lines
    if (activeDrawing.type === 'curve' || activeDrawing.type === 'curvedArrow') {
      // Preview as a simple curved line from start to end
      const startX = activeDrawing.points[0]
      const startY = activeDrawing.points[1]
      const endX = activeDrawing.points[activeDrawing.points.length - 2]
      const endY = activeDrawing.points[activeDrawing.points.length - 1]

      // Calculate control point for preview
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2
      const dx = endX - startX
      const dy = endY - startY
      const perpX = -dy * 0.3
      const perpY = dx * 0.3
      const ctrlX = midX + perpX
      const ctrlY = midY + perpY

      const curvePoints = [startX, startY, ctrlX, ctrlY, endX, endY]

      if (activeDrawing.type === 'curvedArrow') {
        // Calculate arrow direction from control point to end
        const arrowDx = endX - ctrlX
        const arrowDy = endY - ctrlY
        const len = Math.sqrt(arrowDx * arrowDx + arrowDy * arrowDy)
        const unitX = arrowDx / len
        const unitY = arrowDy / len
        const pointerLength = activeDrawing.strokeWidth * 4
        const arrowStartX = endX - unitX * pointerLength
        const arrowStartY = endY - unitY * pointerLength

        return (
          <Group>
            <Line
              points={curvePoints}
              stroke={activeDrawing.color}
              strokeWidth={activeDrawing.strokeWidth}
              tension={0.5}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
            />
            <Arrow
              points={[arrowStartX, arrowStartY, endX, endY]}
              stroke={activeDrawing.color}
              strokeWidth={activeDrawing.strokeWidth}
              fill={activeDrawing.color}
              opacity={0.8}
              pointerLength={pointerLength}
              pointerWidth={activeDrawing.strokeWidth * 3}
            />
          </Group>
        )
      }

      return (
        <Line
          points={curvePoints}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          tension={0.5}
          opacity={0.8}
        />
      )
    }

    // Line or arrow
    if (isArrow) {
      return (
        <Arrow
          points={activeDrawing.points}
          stroke={activeDrawing.color}
          strokeWidth={activeDrawing.strokeWidth}
          fill={activeDrawing.color}
          dash={dash}
          opacity={0.8}
          pointerLength={activeDrawing.strokeWidth * 4}
          pointerWidth={activeDrawing.strokeWidth * 3}
        />
      )
    }

    return (
      <Line
        points={activeDrawing.points}
        stroke={activeDrawing.color}
        strokeWidth={activeDrawing.strokeWidth}
        dash={dash}
        opacity={0.8}
      />
    )
  }

  return (
    <Layer>
      {/* Existing drawings - only render if layer is visible */}
      {isVisible && drawings.map((drawing) => (
        <>{renderDrawing(drawing)}</>
      ))}

      {/* Selection indicators - only show if layer is visible */}
      {isVisible && drawings.map((drawing) => renderSelectionIndicator(drawing))}

      {/* Active drawing being created - always render to allow new drawings */}
      {renderActiveDrawing()}
    </Layer>
  )
}
