import { useTacticalBoardStore, useLayersState, usePlayers, useDrawings, useBall, useEquipment } from '../../store'
import type { LayerName } from '../../types'

interface LayerRowProps {
  name: LayerName
  label: string
  icon: React.ReactNode
  itemCount?: number
  visible: boolean
  locked: boolean
  onToggleVisibility: () => void
  onToggleLock: () => void
}

function LayerRow({
  label,
  icon,
  itemCount,
  visible,
  locked,
  onToggleVisibility,
  onToggleLock,
}: LayerRowProps) {
  return (
    <div
      className={`
        flex items-center gap-2 p-2 rounded-lg transition-colors
        ${visible ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800 opacity-60'}
        border border-gray-200 dark:border-gray-600
      `}
    >
      {/* Visibility toggle */}
      <button
        onClick={onToggleVisibility}
        className={`
          p-1.5 rounded transition-colors
          ${visible ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}
        `}
        title={visible ? 'Hide layer' : 'Show layer'}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </button>

      {/* Layer icon */}
      <div className="text-gray-500 dark:text-gray-400">{icon}</div>

      {/* Layer name */}
      <span className={`flex-1 text-sm font-medium ${visible ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
        {label}
      </span>

      {/* Item count */}
      {itemCount !== undefined && (
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">
          {itemCount}
        </span>
      )}

      {/* Lock toggle */}
      <button
        onClick={onToggleLock}
        className={`
          p-1.5 rounded transition-colors
          ${locked ? 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}
        `}
        title={locked ? 'Unlock layer' : 'Lock layer'}
      >
        {locked ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
        )}
      </button>
    </div>
  )
}

const layerIcons = {
  homePlayers: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#3B82F6" />
      <text x="12" y="16" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">H</text>
    </svg>
  ),
  awayPlayers: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#EF4444" />
      <text x="12" y="16" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">A</text>
    </svg>
  ),
  ball: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" fill="#FCD34D" stroke="#F59E0B" />
    </svg>
  ),
  equipment: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,4 20,20 4,20" fill="#f97316" fillOpacity="0.8" stroke="#c2410c" />
      <line x1="8" y1="14" x2="16" y2="14" stroke="white" strokeWidth="2" />
    </svg>
  ),
  drawings: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  ghostTrails: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="4 2" opacity="0.5" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
}

const layerLabels: Record<LayerName, string> = {
  homePlayers: 'Home Team',
  awayPlayers: 'Away Team',
  ball: 'Ball',
  equipment: 'Equipment',
  drawings: 'Drawings',
  ghostTrails: 'Ghost Trails',
}

export function LayersPanel() {
  const layers = useLayersState()
  const players = usePlayers()
  const drawings = useDrawings()
  const ball = useBall()
  const equipment = useEquipment()
  const { toggleLayerVisibility, toggleLayerLock } = useTacticalBoardStore()

  const homePlayers = players.filter((p) => p.team === 'home')
  const awayPlayers = players.filter((p) => p.team === 'away')

  const layerCounts: Partial<Record<LayerName, number>> = {
    homePlayers: homePlayers.length,
    awayPlayers: awayPlayers.length,
    ball: ball ? 1 : 0,
    equipment: equipment.length,
    drawings: drawings.length,
  }

  const layerOrder: LayerName[] = ['homePlayers', 'awayPlayers', 'ball', 'equipment', 'drawings', 'ghostTrails']

  const allVisible = layerOrder.every((layer) => layers[layer].visible)
  const allLocked = layerOrder.every((layer) => layers[layer].locked)

  const toggleAllVisibility = () => {
    const newVisible = !allVisible
    layerOrder.forEach((layer) => {
      if (layers[layer].visible !== newVisible) {
        toggleLayerVisibility(layer)
      }
    })
  }

  const toggleAllLock = () => {
    const newLocked = !allLocked
    layerOrder.forEach((layer) => {
      if (layers[layer].locked !== newLocked) {
        toggleLayerLock(layer)
      }
    })
  }

  return (
    <div className="p-3 space-y-3">
      {/* Bulk actions */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          All Layers
        </span>
        <div className="flex gap-1">
          <button
            onClick={toggleAllVisibility}
            className={`
              p-1.5 rounded text-xs transition-colors
              ${allVisible ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}
            `}
            title={allVisible ? 'Hide all' : 'Show all'}
          >
            {allVisible ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleAllLock}
            className={`
              p-1.5 rounded text-xs transition-colors
              ${allLocked ? 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}
            `}
            title={allLocked ? 'Unlock all' : 'Lock all'}
          >
            {allLocked ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Layer list */}
      <div className="space-y-2">
        {layerOrder.map((layerName) => (
          <LayerRow
            key={layerName}
            name={layerName}
            label={layerLabels[layerName]}
            icon={layerIcons[layerName]}
            itemCount={layerCounts[layerName]}
            visible={layers[layerName].visible}
            locked={layers[layerName].locked}
            onToggleVisibility={() => toggleLayerVisibility(layerName)}
            onToggleLock={() => toggleLayerLock(layerName)}
          />
        ))}
      </div>

      {/* Info */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Hidden layers won't be visible. Locked layers can't be edited.
        </p>
      </div>
    </div>
  )
}
