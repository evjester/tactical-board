// Ghost trails visualization for animation paths
import { Line, Circle, Group, Text } from 'react-konva'
import { useTacticalBoardStore, useAnimationState, usePlayers, useLayersState } from '../../store'

interface PlayerPath {
  playerId: string
  playerNumber: number
  team: 'home' | 'away'
  color: string
  points: Array<{ x: number; y: number; frameIndex: number }>
}

interface GhostTrailsProps {
  showTrails?: boolean
  showGhostPlayers?: boolean
  trailOpacity?: number
  ghostOpacity?: number
}

export function GhostTrails({
  showTrails = true,
  showGhostPlayers = true,
  trailOpacity = 0.4,
  ghostOpacity = 0.3,
}: GhostTrailsProps) {
  const animationState = useAnimationState()
  const players = usePlayers()
  const layers = useLayersState()
  const currentFrameIndex = useTacticalBoardStore((state) => state.animation.currentFrameIndex)

  // Don't render if layer is hidden
  if (!layers.ghostTrails.visible) {
    return null
  }

  // Don't render if no frames or less than 2 frames
  if (animationState.frames.length < 2) {
    return null
  }

  // Build paths for each player
  const playerPaths: PlayerPath[] = players.map((player) => {
    const points: Array<{ x: number; y: number; frameIndex: number }> = []

    animationState.frames.forEach((frame, frameIndex) => {
      const pos = frame.playerPositions[player.id]
      if (pos) {
        points.push({
          x: pos.x,
          y: pos.y,
          frameIndex,
        })
      }
    })

    return {
      playerId: player.id,
      playerNumber: player.number,
      team: player.team,
      color: player.primaryColor,
      points,
    }
  })

  // Build ball path
  const ballPath: Array<{ x: number; y: number; frameIndex: number }> = []
  animationState.frames.forEach((frame, frameIndex) => {
    if (frame.ballPosition) {
      ballPath.push({
        x: frame.ballPosition.x,
        y: frame.ballPosition.y,
        frameIndex,
      })
    }
  })

  return (
    <Group listening={false}>
      {/* Player trails */}
      {showTrails &&
        playerPaths.map((path) => {
          if (path.points.length < 2) return null

          // Create line points
          const linePoints: number[] = []
          path.points.forEach((point) => {
            linePoints.push(point.x, point.y)
          })

          return (
            <Group key={`trail-${path.playerId}`}>
              {/* Main trail line */}
              <Line
                points={linePoints}
                stroke={path.color}
                strokeWidth={2}
                opacity={trailOpacity}
                lineCap="round"
                lineJoin="round"
                dash={[5, 5]}
              />

              {/* Keyframe markers */}
              {path.points.map((point, idx) => (
                <Circle
                  key={`marker-${path.playerId}-${idx}`}
                  x={point.x}
                  y={point.y}
                  radius={4}
                  fill={point.frameIndex === currentFrameIndex ? path.color : 'white'}
                  stroke={path.color}
                  strokeWidth={1.5}
                  opacity={trailOpacity + 0.2}
                />
              ))}

              {/* Direction arrows along path */}
              {path.points.slice(0, -1).map((point, idx) => {
                const nextPoint = path.points[idx + 1]
                const midX = (point.x + nextPoint.x) / 2
                const midY = (point.y + nextPoint.y) / 2
                const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x)

                const arrowSize = 6
                const arrowPoints = [
                  midX - arrowSize * Math.cos(angle - Math.PI / 6),
                  midY - arrowSize * Math.sin(angle - Math.PI / 6),
                  midX,
                  midY,
                  midX - arrowSize * Math.cos(angle + Math.PI / 6),
                  midY - arrowSize * Math.sin(angle + Math.PI / 6),
                ]

                return (
                  <Line
                    key={`arrow-${path.playerId}-${idx}`}
                    points={arrowPoints}
                    stroke={path.color}
                    strokeWidth={1.5}
                    opacity={trailOpacity}
                    lineCap="round"
                    lineJoin="round"
                  />
                )
              })}
            </Group>
          )
        })}

      {/* Ball trail */}
      {showTrails && ballPath.length >= 2 && (
        <Group>
          <Line
            points={ballPath.flatMap((p) => [p.x, p.y])}
            stroke="#f59e0b"
            strokeWidth={2}
            opacity={trailOpacity}
            lineCap="round"
            lineJoin="round"
            dash={[3, 3]}
          />
          {ballPath.map((point, idx) => (
            <Circle
              key={`ball-marker-${idx}`}
              x={point.x}
              y={point.y}
              radius={3}
              fill={point.frameIndex === currentFrameIndex ? '#f59e0b' : 'white'}
              stroke="#f59e0b"
              strokeWidth={1}
              opacity={trailOpacity + 0.2}
            />
          ))}
        </Group>
      )}

      {/* Ghost players at other keyframes */}
      {showGhostPlayers &&
        animationState.frames.map((frame, frameIndex) => {
          // Skip current frame
          if (frameIndex === currentFrameIndex) return null

          return (
            <Group key={`ghost-frame-${frameIndex}`} opacity={ghostOpacity}>
              {players.map((player) => {
                const pos = frame.playerPositions[player.id]
                if (!pos) return null

                return (
                  <Group key={`ghost-${player.id}-${frameIndex}`}>
                    {/* Ghost player circle */}
                    <Circle
                      x={pos.x}
                      y={pos.y}
                      radius={18}
                      fill={player.primaryColor}
                      stroke={player.secondaryColor}
                      strokeWidth={2}
                    />
                    {/* Player number */}
                    <Text
                      x={pos.x - 8}
                      y={pos.y - 6}
                      text={String(player.number)}
                      fontSize={12}
                      fontStyle="bold"
                      fill={player.secondaryColor}
                      width={16}
                      align="center"
                    />
                    {/* Frame number indicator */}
                    <Circle
                      x={pos.x + 12}
                      y={pos.y - 12}
                      radius={8}
                      fill="#374151"
                    />
                    <Text
                      x={pos.x + 12 - 4}
                      y={pos.y - 12 - 5}
                      text={String(frameIndex + 1)}
                      fontSize={10}
                      fill="white"
                      width={8}
                      align="center"
                    />
                  </Group>
                )
              })}

              {/* Ghost ball */}
              {frame.ballPosition && (
                <Circle
                  x={frame.ballPosition.x}
                  y={frame.ballPosition.y}
                  radius={10}
                  fill="#f59e0b"
                  stroke="#d97706"
                  strokeWidth={2}
                />
              )}
            </Group>
          )
        })}
    </Group>
  )
}
