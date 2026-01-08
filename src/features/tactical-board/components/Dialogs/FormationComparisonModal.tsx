// Formation Comparison Modal - Compare two formations side by side
import { useState, useMemo } from 'react'
import { useTacticalBoardStore, usePlayers } from '../../store'
import { FORMATIONS } from '../../constants'
import { getCustomFormations } from '../../utils/customTemplates'

interface FormationComparisonModalProps {
  isOpen: boolean
  onClose: () => void
}

type FormationOption = {
  id: string
  name: string
  type: 'preset' | 'custom' | 'current'
  positions: Array<{ x: number; y: number; positionCode: string }>
}

export function FormationComparisonModal({ isOpen, onClose }: FormationComparisonModalProps) {
  const players = usePlayers()
  const teamColors = useTacticalBoardStore((state) => state.teamColors)

  const [leftFormation, setLeftFormation] = useState<string>('current')
  const [rightFormation, setRightFormation] = useState<string>('4-3-3')

  // Build all available formations
  const formationOptions = useMemo((): FormationOption[] => {
    const options: FormationOption[] = []

    // Current formation
    const homePlayers = players.filter((p) => p.team === 'home')
    if (homePlayers.length > 0) {
      options.push({
        id: 'current',
        name: 'Current Formation',
        type: 'current',
        positions: homePlayers.map((p) => ({
          x: p.x / 540, // Normalize to 0-1
          y: p.y / 800,
          positionCode: p.positionCode,
        })),
      })
    }

    // Preset formations
    Object.entries(FORMATIONS).forEach(([key, formation]) => {
      options.push({
        id: key,
        name: formation.name,
        type: 'preset',
        positions: formation.positions.map((p) => ({
          x: p.x,
          y: p.y,
          positionCode: p.positionCode,
        })),
      })
    })

    // Custom formations
    const customFormations = getCustomFormations()
    customFormations.forEach((custom) => {
      options.push({
        id: custom.id,
        name: custom.name,
        type: 'custom',
        positions: custom.positions.map((p) => ({
          x: p.relativeX,
          y: p.relativeY,
          positionCode: p.positionCode,
        })),
      })
    })

    return options
  }, [players])

  const getFormation = (id: string): FormationOption | undefined => {
    return formationOptions.find((f) => f.id === id)
  }

  const leftData = getFormation(leftFormation)
  const rightData = getFormation(rightFormation)

  // Mini pitch dimensions
  const pitchWidth = 200
  const pitchHeight = 300

  if (!isOpen) return null

  const renderMiniPitch = (formation: FormationOption | undefined, side: 'left' | 'right') => {
    const color = side === 'left' ? teamColors.home.primary : teamColors.away.primary
    const secondaryColor = side === 'left' ? teamColors.home.secondary : teamColors.away.secondary

    return (
      <div className="relative bg-green-600 rounded-lg overflow-hidden" style={{ width: pitchWidth, height: pitchHeight }}>
        {/* Pitch markings */}
        <svg width={pitchWidth} height={pitchHeight} className="absolute inset-0">
          {/* Center line */}
          <line x1="0" y1={pitchHeight / 2} x2={pitchWidth} y2={pitchHeight / 2} stroke="white" strokeWidth="1" opacity="0.5" />
          {/* Center circle */}
          <circle cx={pitchWidth / 2} cy={pitchHeight / 2} r="20" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
          {/* Penalty areas */}
          <rect x={(pitchWidth - 80) / 2} y="0" width="80" height="40" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
          <rect x={(pitchWidth - 80) / 2} y={pitchHeight - 40} width="80" height="40" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
        </svg>

        {/* Players */}
        {formation?.positions.map((pos, idx) => (
          <div
            key={idx}
            className="absolute rounded-full flex items-center justify-center text-xs font-bold border-2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: pos.x * pitchWidth,
              top: pos.y * pitchHeight,
              width: 24,
              height: 24,
              backgroundColor: color,
              borderColor: secondaryColor,
              color: secondaryColor,
            }}
          >
            {idx + 1}
          </div>
        ))}

        {!formation && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm opacity-70">
            Select a formation
          </div>
        )}
      </div>
    )
  }

  // Calculate differences
  const calculateDifferences = () => {
    if (!leftData || !rightData) return null

    const leftCount = leftData.positions.length
    const rightCount = rightData.positions.length

    // Calculate average position heights
    const leftAvgY = leftData.positions.reduce((sum, p) => sum + p.y, 0) / leftCount
    const rightAvgY = rightData.positions.reduce((sum, p) => sum + p.y, 0) / rightCount

    // Calculate width spread
    const leftMinX = Math.min(...leftData.positions.map((p) => p.x))
    const leftMaxX = Math.max(...leftData.positions.map((p) => p.x))
    const rightMinX = Math.min(...rightData.positions.map((p) => p.x))
    const rightMaxX = Math.max(...rightData.positions.map((p) => p.x))

    const leftWidth = leftMaxX - leftMinX
    const rightWidth = rightMaxX - rightMinX

    return {
      leftCount,
      rightCount,
      leftAvgY: (leftAvgY * 100).toFixed(0),
      rightAvgY: (rightAvgY * 100).toFixed(0),
      leftWidth: (leftWidth * 100).toFixed(0),
      rightWidth: (rightWidth * 100).toFixed(0),
      heightDiff: leftAvgY < rightAvgY ? 'Left is higher' : leftAvgY > rightAvgY ? 'Right is higher' : 'Same height',
      widthDiff: leftWidth > rightWidth ? 'Left is wider' : leftWidth < rightWidth ? 'Right is wider' : 'Same width',
    }
  }

  const differences = calculateDifferences()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Formation Comparison</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Formation selectors and pitches */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left side */}
          <div className="space-y-3">
            <select
              value={leftFormation}
              onChange={(e) => setLeftFormation(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <optgroup label="Current">
                {formationOptions.filter((f) => f.type === 'current').map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="Preset Formations">
                {formationOptions.filter((f) => f.type === 'preset').map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              {formationOptions.filter((f) => f.type === 'custom').length > 0 && (
                <optgroup label="Custom Formations">
                  {formationOptions.filter((f) => f.type === 'custom').map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className="flex justify-center">
              {renderMiniPitch(leftData, 'left')}
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {leftData?.positions.length || 0} players
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-3">
            <select
              value={rightFormation}
              onChange={(e) => setRightFormation(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <optgroup label="Current">
                {formationOptions.filter((f) => f.type === 'current').map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="Preset Formations">
                {formationOptions.filter((f) => f.type === 'preset').map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              {formationOptions.filter((f) => f.type === 'custom').length > 0 && (
                <optgroup label="Custom Formations">
                  {formationOptions.filter((f) => f.type === 'custom').map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className="flex justify-center">
              {renderMiniPitch(rightData, 'right')}
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {rightData?.positions.length || 0} players
            </div>
          </div>
        </div>

        {/* Comparison stats */}
        {differences && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Comparison</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Avg. Height:</span>
                <span className="ml-2 text-gray-800 dark:text-white">{differences.leftAvgY}%</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Avg. Height:</span>
                <span className="ml-2 text-gray-800 dark:text-white">{differences.rightAvgY}%</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Width Spread:</span>
                <span className="ml-2 text-gray-800 dark:text-white">{differences.leftWidth}%</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Width Spread:</span>
                <span className="ml-2 text-gray-800 dark:text-white">{differences.rightWidth}%</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Summary:</strong> {differences.heightDiff}. {differences.widthDiff}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
