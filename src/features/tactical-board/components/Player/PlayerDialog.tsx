import { useState, useEffect } from 'react'
import { useTacticalBoardStore } from '../../store'
import type { Player, PlayerSize } from '../../types'

interface PlayerDialogProps {
  player: Player
  isOpen: boolean
  onClose: () => void
}

const POSITION_OPTIONS = [
  { code: 'GK', name: 'Goalkeeper' },
  { code: 'CB', name: 'Center Back' },
  { code: 'LCB', name: 'Left Center Back' },
  { code: 'RCB', name: 'Right Center Back' },
  { code: 'LB', name: 'Left Back' },
  { code: 'RB', name: 'Right Back' },
  { code: 'LWB', name: 'Left Wing Back' },
  { code: 'RWB', name: 'Right Wing Back' },
  { code: 'CDM', name: 'Defensive Midfielder' },
  { code: 'LDM', name: 'Left Def. Midfielder' },
  { code: 'RDM', name: 'Right Def. Midfielder' },
  { code: 'CM', name: 'Central Midfielder' },
  { code: 'LCM', name: 'Left Central Mid' },
  { code: 'RCM', name: 'Right Central Mid' },
  { code: 'LM', name: 'Left Midfielder' },
  { code: 'RM', name: 'Right Midfielder' },
  { code: 'CAM', name: 'Attacking Midfielder' },
  { code: 'LAM', name: 'Left Att. Midfielder' },
  { code: 'RAM', name: 'Right Att. Midfielder' },
  { code: 'LW', name: 'Left Winger' },
  { code: 'RW', name: 'Right Winger' },
  { code: 'ST', name: 'Striker' },
  { code: 'LST', name: 'Left Striker' },
  { code: 'RST', name: 'Right Striker' },
  { code: 'CF', name: 'Center Forward' },
]

export function PlayerDialog({ player, isOpen, onClose }: PlayerDialogProps) {
  const { updatePlayer, removePlayer, pushHistory } = useTacticalBoardStore()

  const [number, setNumber] = useState(player.number)
  const [name, setName] = useState(player.name)
  const [positionCode, setPositionCode] = useState(player.positionCode)
  const [size, setSize] = useState<PlayerSize>(player.size)
  const [rotation, setRotation] = useState(player.rotation)

  // Sync state when player changes
  useEffect(() => {
    setNumber(player.number)
    setName(player.name)
    setPositionCode(player.positionCode)
    setSize(player.size)
    setRotation(player.rotation)
  }, [player])

  if (!isOpen) return null

  const handleSave = () => {
    pushHistory()
    updatePlayer(player.id, {
      number,
      name,
      positionCode,
      size,
      rotation,
    })
    onClose()
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this player?')) {
      removePlayer(player.id)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      handleSave()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-80 max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: player.primaryColor }}
        >
          <h2 className="text-lg font-semibold text-white">Edit Player</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={number}
              onChange={(e) => setNumber(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              value={positionCode}
              onChange={(e) => setPositionCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select position...</option>
              {POSITION_OPTIONS.map((pos) => (
                <option key={pos.code} value={pos.code}>
                  {pos.code} - {pos.name}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSize('small')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  size === 'small'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Small
              </button>
              <button
                onClick={() => setSize('large')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  size === 'large'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Large
              </button>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotation: {rotation}°
            </label>
            <input
              type="range"
              min={-180}
              max={180}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>-180°</span>
              <button
                onClick={() => setRotation(0)}
                className="text-blue-500 hover:text-blue-600"
              >
                Reset
              </button>
              <span>180°</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
