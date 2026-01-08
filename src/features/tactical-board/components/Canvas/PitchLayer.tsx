import { Layer, Rect, Line, Circle, Arc, Group } from 'react-konva'
import { PITCH, PITCH_THEMES } from '../../constants'
import type { PitchView } from '../../constants/pitchDimensions'
import type { PitchTheme } from '../../constants/colors'

interface PitchLayerProps {
  width: number
  height: number
  theme: PitchTheme
  view: PitchView
  showGrid?: boolean
  gridSize?: number
}

export function PitchLayer({
  width: _containerWidth,
  height: _containerHeight,
  theme,
  view,
  showGrid = false,
  gridSize = 20,
}: PitchLayerProps) {
  void _containerWidth
  void _containerHeight
  const themeColors = PITCH_THEMES[theme]
  const scale = PITCH.SCALE

  // Determine if horizontal (goals on left/right) or vertical (goals on top/bottom)
  const isHorizontal = view === 'full'
  const isHalf = view === 'half'

  // Pitch dimensions based on orientation
  const pitchWidth = isHorizontal ? PITCH.REAL_WIDTH * scale : PITCH.REAL_HEIGHT * scale
  const pitchHeight = isHorizontal
    ? PITCH.REAL_HEIGHT * scale
    : isHalf
      ? (PITCH.REAL_WIDTH * scale) / 2
      : PITCH.REAL_WIDTH * scale

  // Key measurements
  const penaltyAreaWidth = PITCH.PENALTY_AREA.WIDTH * scale
  const penaltyAreaDepth = PITCH.PENALTY_AREA.DEPTH * scale
  const goalAreaWidth = PITCH.GOAL_AREA.WIDTH * scale
  const goalAreaDepth = PITCH.GOAL_AREA.DEPTH * scale
  const centerCircleRadius = PITCH.CENTER_CIRCLE_RADIUS * scale
  const penaltySpotDistance = PITCH.PENALTY_SPOT * scale
  const penaltyArcRadius = PITCH.PENALTY_ARC_RADIUS * scale
  const cornerArcRadius = PITCH.CORNER_ARC_RADIUS * scale
  const goalWidth = PITCH.GOAL_WIDTH * scale

  const lineWidth = PITCH.LINE_WIDTH
  const lineColor = themeColors.lines

  // Render penalty area for horizontal layout (goals on sides)
  const renderHorizontalPenaltyArea = (isLeft: boolean) => {
    const xOffset = isLeft ? 0 : pitchWidth - penaltyAreaDepth
    const penaltySpotX = isLeft ? penaltySpotDistance : pitchWidth - penaltySpotDistance

    // Calculate the arc angle based on where it intersects the penalty area line
    // Distance from penalty spot to penalty area edge = penaltyAreaDepth - penaltySpotDistance
    const distToEdge = penaltyAreaDepth - penaltySpotDistance
    // Angle where arc intersects the penalty area line: arccos(distToEdge / penaltyArcRadius)
    const intersectAngle = Math.acos(distToEdge / penaltyArcRadius) * (180 / Math.PI)
    // Total arc angle is twice this (symmetric on both sides)
    const arcAngle = intersectAngle * 2

    // For left: arc faces rightward (0°), so start at 360° - intersectAngle (or -intersectAngle)
    // For right: arc faces leftward (180°), so start at 180° - intersectAngle
    const arcRotation = isLeft ? 360 - intersectAngle : 180 - intersectAngle

    return (
      <Group key={isLeft ? 'penalty-left' : 'penalty-right'}>
        {/* Penalty area box */}
        <Rect
          x={xOffset}
          y={(pitchHeight - penaltyAreaWidth) / 2}
          width={penaltyAreaDepth}
          height={penaltyAreaWidth}
          stroke={lineColor}
          strokeWidth={lineWidth}
          fill="transparent"
        />

        {/* Goal area box */}
        <Rect
          x={isLeft ? 0 : pitchWidth - goalAreaDepth}
          y={(pitchHeight - goalAreaWidth) / 2}
          width={goalAreaDepth}
          height={goalAreaWidth}
          stroke={lineColor}
          strokeWidth={lineWidth}
          fill="transparent"
        />

        {/* Penalty spot */}
        <Circle x={penaltySpotX} y={pitchHeight / 2} radius={3} fill={lineColor} />

        {/* Penalty arc */}
        <Arc
          x={penaltySpotX}
          y={pitchHeight / 2}
          innerRadius={penaltyArcRadius}
          outerRadius={penaltyArcRadius}
          angle={arcAngle}
          rotation={arcRotation}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />

        {/* Goal indicator */}
        <Rect
          x={isLeft ? -8 : pitchWidth}
          y={(pitchHeight - goalWidth) / 2}
          width={8}
          height={goalWidth}
          fill={lineColor}
          opacity={0.3}
          cornerRadius={isLeft ? [4, 0, 0, 4] : [0, 4, 4, 0]}
        />
      </Group>
    )
  }

  // Render penalty area for vertical layout (goals on top/bottom)
  const renderVerticalPenaltyArea = (isTop: boolean) => {
    const yOffset = isTop ? 0 : pitchHeight - penaltyAreaDepth
    const penaltySpotY = isTop ? penaltySpotDistance : pitchHeight - penaltySpotDistance

    // Calculate the arc angle based on where it intersects the penalty area line
    // Distance from penalty spot to penalty area edge = penaltyAreaDepth - penaltySpotDistance
    const distToEdge = penaltyAreaDepth - penaltySpotDistance
    // Angle where arc intersects the penalty area line: arccos(distToEdge / penaltyArcRadius)
    const intersectAngle = Math.acos(distToEdge / penaltyArcRadius) * (180 / Math.PI)
    // Total arc angle is twice this (symmetric on both sides)
    const arcAngle = intersectAngle * 2

    // For top: arc faces downward (90°), so start at 90° - intersectAngle
    // For bottom: arc faces upward (270°), so start at 270° - intersectAngle
    const arcRotation = isTop ? 90 - intersectAngle : 270 - intersectAngle

    return (
      <Group key={isTop ? 'penalty-top' : 'penalty-bottom'}>
        {/* Penalty area box */}
        <Rect
          x={(pitchWidth - penaltyAreaWidth) / 2}
          y={yOffset}
          width={penaltyAreaWidth}
          height={penaltyAreaDepth}
          stroke={lineColor}
          strokeWidth={lineWidth}
          fill="transparent"
        />

        {/* Goal area box */}
        <Rect
          x={(pitchWidth - goalAreaWidth) / 2}
          y={isTop ? 0 : pitchHeight - goalAreaDepth}
          width={goalAreaWidth}
          height={goalAreaDepth}
          stroke={lineColor}
          strokeWidth={lineWidth}
          fill="transparent"
        />

        {/* Penalty spot */}
        <Circle x={pitchWidth / 2} y={penaltySpotY} radius={3} fill={lineColor} />

        {/* Penalty arc */}
        <Arc
          x={pitchWidth / 2}
          y={penaltySpotY}
          innerRadius={penaltyArcRadius}
          outerRadius={penaltyArcRadius}
          angle={arcAngle}
          rotation={arcRotation}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />

        {/* Goal indicator */}
        <Rect
          x={(pitchWidth - goalWidth) / 2}
          y={isTop ? -8 : pitchHeight}
          width={goalWidth}
          height={8}
          fill={lineColor}
          opacity={0.3}
          cornerRadius={isTop ? [4, 4, 0, 0] : [0, 0, 4, 4]}
        />
      </Group>
    )
  }

  // Render corner arc
  const renderCornerArc = (x: number, y: number, rotation: number) => (
    <Arc
      key={`corner-${x}-${y}`}
      x={x}
      y={y}
      innerRadius={cornerArcRadius}
      outerRadius={cornerArcRadius}
      angle={90}
      rotation={rotation}
      stroke={lineColor}
      strokeWidth={lineWidth}
    />
  )

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null

    const lines = []
    for (let x = gridSize; x < pitchWidth; x += gridSize) {
      lines.push(
        <Line
          key={`grid-v-${x}`}
          points={[x, 0, x, pitchHeight]}
          stroke={lineColor}
          strokeWidth={0.5}
          opacity={0.2}
        />
      )
    }
    for (let y = gridSize; y < pitchHeight; y += gridSize) {
      lines.push(
        <Line
          key={`grid-h-${y}`}
          points={[0, y, pitchWidth, y]}
          stroke={lineColor}
          strokeWidth={0.5}
          opacity={0.2}
        />
      )
    }
    return lines
  }

  // Render grass stripes
  const renderGrassStripes = () => {
    if (isHorizontal) {
      // Vertical stripes for horizontal pitch
      return Array.from({ length: Math.ceil(pitchWidth / 50) }).map((_, i) => (
        <Rect
          key={`stripe-${i}`}
          x={i * 50}
          y={0}
          width={50}
          height={pitchHeight}
          fill={i % 2 === 0 ? themeColors.grass : themeColors.grassDark}
          opacity={0.3}
        />
      ))
    } else {
      // Horizontal stripes for vertical pitch
      return Array.from({ length: Math.ceil(pitchHeight / 50) }).map((_, i) => (
        <Rect
          key={`stripe-${i}`}
          x={0}
          y={i * 50}
          width={pitchWidth}
          height={50}
          fill={i % 2 === 0 ? themeColors.grass : themeColors.grassDark}
          opacity={0.3}
        />
      ))
    }
  }

  return (
    <Layer listening={false}>
      {/* Grass background */}
      <Rect x={0} y={0} width={pitchWidth} height={pitchHeight} fill={themeColors.grass} />

      {/* Grass stripes */}
      {renderGrassStripes()}

      {/* Grid overlay */}
      {renderGrid()}

      {/* Pitch outline */}
      <Rect
        x={0}
        y={0}
        width={pitchWidth}
        height={pitchHeight}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="transparent"
      />

      {/* Center line */}
      {!isHalf && (
        <Line
          points={
            isHorizontal
              ? [pitchWidth / 2, 0, pitchWidth / 2, pitchHeight] // Vertical center line
              : [0, pitchHeight / 2, pitchWidth, pitchHeight / 2] // Horizontal center line
          }
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
      )}

      {/* Center circle and spot */}
      {!isHalf && (
        <>
          <Circle
            x={pitchWidth / 2}
            y={pitchHeight / 2}
            radius={centerCircleRadius}
            stroke={lineColor}
            strokeWidth={lineWidth}
            fill="transparent"
          />
          <Circle x={pitchWidth / 2} y={pitchHeight / 2} radius={3} fill={lineColor} />
        </>
      )}

      {/* Penalty areas */}
      {isHorizontal ? (
        <>
          {renderHorizontalPenaltyArea(true)}
          {!isHalf && renderHorizontalPenaltyArea(false)}
        </>
      ) : (
        <>
          {renderVerticalPenaltyArea(true)}
          {!isHalf && renderVerticalPenaltyArea(false)}
        </>
      )}

      {/* Corner arcs */}
      {renderCornerArc(0, 0, 0)}
      {renderCornerArc(pitchWidth, 0, 90)}
      {!isHalf && (
        <>
          {renderCornerArc(pitchWidth, pitchHeight, 180)}
          {renderCornerArc(0, pitchHeight, 270)}
        </>
      )}

      {/* Half-way line indicator for half pitch view */}
      {isHalf && (
        <Line
          points={[0, pitchHeight, pitchWidth, pitchHeight]}
          stroke={lineColor}
          strokeWidth={lineWidth * 2}
          dash={[10, 5]}
        />
      )}
    </Layer>
  )
}
