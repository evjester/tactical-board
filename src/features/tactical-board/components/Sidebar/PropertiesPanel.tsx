import { useState } from 'react'
import { useTacticalBoardStore, usePlayers, useDrawings, useCanvasState } from '../../store'
import type { Player } from '../../types'
import { detectPosition, detectFormation } from '../../utils'

export function PropertiesPanel() {
  const players = usePlayers()
  const drawings = useDrawings()
  const canvas = useCanvasState()
  const selectedPlayerIds = useTacticalBoardStore((state) => state.selectedPlayerIds)
  const selectedDrawingIds = useTacticalBoardStore((state) => state.selectedDrawingIds)
  const ball = useTacticalBoardStore((state) => state.ball)
  const { updatePlayer, updateDrawing, removePlayer, removeDrawing, removeBall } = useTacticalBoardStore()

  const selectedPlayers = players.filter((p) => selectedPlayerIds.includes(p.id))
  const selectedDrawings = drawings.filter((d) => selectedDrawingIds.includes(d.id))
  const isBallSelected = ball?.isSelected

  // No selection
  if (selectedPlayers.length === 0 && selectedDrawings.length === 0 && !isBallSelected) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Select an element to view and edit its properties
      </div>
    )
  }

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Player Properties */}
      {selectedPlayers.length > 0 && (
        <PlayerProperties
          players={selectedPlayers}
          allPlayers={players}
          pitchView={canvas.pitchView}
          updatePlayer={updatePlayer}
          removePlayer={removePlayer}
        />
      )}

      {/* Drawing Properties */}
      {selectedDrawings.length > 0 && (
        <DrawingProperties
          drawings={selectedDrawings}
          updateDrawing={updateDrawing}
          removeDrawing={removeDrawing}
        />
      )}

      {/* Ball Properties */}
      {isBallSelected && ball && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase">Ball</h3>
          <div className="text-sm text-gray-600">
            Position: ({Math.round(ball.x)}, {Math.round(ball.y)})
          </div>
          <button
            onClick={removeBall}
            className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Remove Ball
          </button>
        </div>
      )}
    </div>
  )
}

interface PlayerPropertiesProps {
  players: Player[]
  allPlayers: Player[]
  pitchView: 'full' | 'half' | 'vertical'
  updatePlayer: (id: string, updates: Partial<Player>) => void
  removePlayer: (id: string) => void
}

function PlayerProperties({ players, allPlayers, pitchView, updatePlayer, removePlayer }: PlayerPropertiesProps) {
  const [arrowDirection, setArrowDirection] = useState(0)
  const [arrowLength, setArrowLength] = useState(60)

  const isMultiple = players.length > 1
  const firstPlayer = players[0]

  // Auto-detect formation for selected player's team
  const teamFormation = detectFormation(allPlayers, firstPlayer.team, pitchView)

  const handleAddMovementArrow = () => {
    players.forEach((player) => {
      updatePlayer(player.id, {
        movementArrow: {
          direction: arrowDirection,
          length: arrowLength,
        },
      })
    })
  }

  const handleRemoveMovementArrow = () => {
    players.forEach((player) => {
      updatePlayer(player.id, { movementArrow: undefined })
    })
  }

  const handleNumberChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0 && num <= 99) {
      updatePlayer(firstPlayer.id, { number: num })
    }
  }

  const handleNameChange = (value: string) => {
    updatePlayer(firstPlayer.id, { name: value })
  }

  const handleSizeChange = (size: 'small' | 'large') => {
    players.forEach((player) => {
      updatePlayer(player.id, { size })
    })
  }

  const handleRotationChange = (rotation: number) => {
    players.forEach((player) => {
      updatePlayer(player.id, { rotation })
    })
  }

  const handleAutoDetectPosition = () => {
    players.forEach((player) => {
      const detectedPosition = detectPosition(player.x, player.y, player.team, pitchView)
      updatePlayer(player.id, { positionCode: detectedPosition })
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-gray-700 uppercase">
        {isMultiple ? `${players.length} Players Selected` : 'Player Properties'}
      </h3>

      {/* Single player properties */}
      {!isMultiple && (
        <>
          {/* Number */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Number</label>
            <input
              type="number"
              min="1"
              max="99"
              value={firstPlayer.number}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Name</label>
            <input
              type="text"
              value={firstPlayer.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Player name"
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Position */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Position</label>
            <select
              value={firstPlayer.positionCode}
              onChange={(e) => updatePlayer(firstPlayer.id, { positionCode: e.target.value })}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None</option>
              <option value="GK">GK - Goalkeeper</option>
              <option value="CB">CB - Center Back</option>
              <option value="LB">LB - Left Back</option>
              <option value="RB">RB - Right Back</option>
              <option value="CDM">CDM - Defensive Mid</option>
              <option value="CM">CM - Center Mid</option>
              <option value="LM">LM - Left Mid</option>
              <option value="RM">RM - Right Mid</option>
              <option value="CAM">CAM - Attacking Mid</option>
              <option value="LW">LW - Left Wing</option>
              <option value="RW">RW - Right Wing</option>
              <option value="ST">ST - Striker</option>
              <option value="CF">CF - Center Forward</option>
            </select>
          </div>
        </>
      )}

      {/* Size (works for multiple) */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Size</label>
        <div className="flex gap-1">
          <button
            onClick={() => handleSizeChange('small')}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors ${
              firstPlayer.size === 'small'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Small
          </button>
          <button
            onClick={() => handleSizeChange('large')}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors ${
              firstPlayer.size === 'large'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Large
          </button>
        </div>
      </div>

      {/* Rotation (works for multiple) */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Rotation: {firstPlayer.rotation}°</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="-180"
            max="180"
            value={firstPlayer.rotation}
            onChange={(e) => handleRotationChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <button
            onClick={() => handleRotationChange(0)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Auto-detect position */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleAutoDetectPosition}
          className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          Auto-Detect Position
        </button>
        {teamFormation && (
          <span className="text-xs text-gray-500 text-center">
            Detected Formation: {teamFormation}
          </span>
        )}
      </div>

      {/* Movement Arrow */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
        <label className="text-xs font-semibold text-gray-700 uppercase">Movement Arrow</label>

        {/* Direction */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Direction (0° = Up)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="360"
              value={arrowDirection}
              onChange={(e) => setArrowDirection(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-600 w-10">{arrowDirection}°</span>
          </div>
          {/* Direction preset buttons */}
          <div className="grid grid-cols-4 gap-1 mt-1">
            {[
              { label: '↑', value: 0 },
              { label: '↗', value: 45 },
              { label: '→', value: 90 },
              { label: '↘', value: 135 },
              { label: '↓', value: 180 },
              { label: '↙', value: 225 },
              { label: '←', value: 270 },
              { label: '↖', value: 315 },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setArrowDirection(value)}
                className={`p-1 text-xs rounded ${
                  arrowDirection === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Length</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="20"
              max="150"
              value={arrowLength}
              onChange={(e) => setArrowLength(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-600 w-10">{arrowLength}px</span>
          </div>
        </div>

        {/* Add/Remove buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddMovementArrow}
            className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Arrow
          </button>
          <button
            onClick={handleRemoveMovementArrow}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => players.forEach((p) => removePlayer(p.id))}
        className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors mt-2"
      >
        Delete {isMultiple ? 'Players' : 'Player'}
      </button>
    </div>
  )
}

interface DrawingPropertiesProps {
  drawings: Array<{ id: string; color: string; strokeWidth: number; opacity: number }>
  updateDrawing: (id: string, updates: Record<string, unknown>) => void
  removeDrawing: (id: string) => void
}

function DrawingProperties({ drawings, updateDrawing, removeDrawing }: DrawingPropertiesProps) {
  const isMultiple = drawings.length > 1
  const firstDrawing = drawings[0]

  const handleColorChange = (color: string) => {
    drawings.forEach((d) => updateDrawing(d.id, { color }))
  }

  const handleStrokeWidthChange = (strokeWidth: number) => {
    drawings.forEach((d) => updateDrawing(d.id, { strokeWidth }))
  }

  const handleOpacityChange = (opacity: number) => {
    drawings.forEach((d) => updateDrawing(d.id, { opacity }))
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-gray-700 uppercase">
        {isMultiple ? `${drawings.length} Drawings Selected` : 'Drawing Properties'}
      </h3>

      {/* Color */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Color</label>
        <input
          type="color"
          value={firstDrawing.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-8 rounded-lg cursor-pointer"
        />
      </div>

      {/* Stroke Width */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Stroke Width</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="10"
            value={firstDrawing.strokeWidth}
            onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 w-8">{firstDrawing.strokeWidth}px</span>
        </div>
      </div>

      {/* Opacity */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Opacity</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={firstDrawing.opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 w-8">{Math.round(firstDrawing.opacity * 100)}%</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => drawings.forEach((d) => removeDrawing(d.id))}
        className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors mt-2"
      >
        Delete {isMultiple ? 'Drawings' : 'Drawing'}
      </button>
    </div>
  )
}
