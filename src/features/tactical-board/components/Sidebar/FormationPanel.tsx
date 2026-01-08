import { useState } from 'react'
import { useTacticalBoardStore, useTeamColors } from '../../store'
import { FORMATIONS } from '../../constants'
import type { FormationTemplate } from '../../constants/formations'

// Group formations by style
const formationGroups = {
  'Defensive': FORMATIONS.filter(f => ['5-4-1', '5-3-2', '4-5-1'].includes(f.code)),
  'Balanced': FORMATIONS.filter(f => ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2'].includes(f.code)),
  'Attacking': FORMATIONS.filter(f => ['3-4-3', '4-1-4-1', '4-3-2-1'].includes(f.code)),
  'Other': FORMATIONS.filter(f => !['5-4-1', '5-3-2', '4-5-1', '4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '3-4-3', '4-1-4-1', '4-3-2-1'].includes(f.code)),
}

interface FormationDropdownProps {
  onSelect: (formation: FormationTemplate) => void
  color: string
}

function FormationDropdown({ onSelect, color }: FormationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<FormationTemplate | null>(null)

  const handleSelect = (formation: FormationTemplate) => {
    setSelectedFormation(formation)
    onSelect(formation)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
        style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
      >
        <span className="text-gray-700 dark:text-gray-200">
          {selectedFormation ? selectedFormation.code : 'Select Formation'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {Object.entries(formationGroups).map(([groupName, formations]) => (
              formations.length > 0 && (
                <div key={groupName}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                    {groupName}
                  </div>
                  {formations.map((formation) => (
                    <button
                      key={formation.code}
                      onClick={() => handleSelect(formation)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedFormation?.code === formation.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-700 dark:text-gray-200">{formation.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formation.description}</div>
                    </button>
                  ))}
                </div>
              )
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function FormationPanel() {
  const { loadFormation, clearTeam, setTeamColors } = useTacticalBoardStore()
  const teamColors = useTeamColors()
  const players = useTacticalBoardStore((state) => state.players)

  const homePlayers = players.filter((p) => p.team === 'home')
  const awayPlayers = players.filter((p) => p.team === 'away')

  const handleLoadFormation = (team: 'home' | 'away', formation: FormationTemplate) => {
    loadFormation(team, formation.positions)
  }

  return (
    <div className="p-3 space-y-4">
      {/* Home Team Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: teamColors.home.primary }}
            />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Home Team</h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {homePlayers.length} players
          </span>
        </div>

        {/* Formation Dropdown */}
        <FormationDropdown
          onSelect={(f) => handleLoadFormation('home', f)}
          color={teamColors.home.primary}
        />

        {/* Team Color Picker */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400">Primary</label>
            <input
              type="color"
              value={teamColors.home.primary}
              onChange={(e) => setTeamColors('home', { primary: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400">Text</label>
            <input
              type="color"
              value={teamColors.home.secondary}
              onChange={(e) => setTeamColors('home', { secondary: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <button
            onClick={() => clearTeam('home')}
            disabled={homePlayers.length === 0}
            className="ml-auto px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Away Team Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: teamColors.away.primary }}
            />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Away Team</h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {awayPlayers.length} players
          </span>
        </div>

        {/* Formation Dropdown */}
        <FormationDropdown
          onSelect={(f) => handleLoadFormation('away', f)}
          color={teamColors.away.primary}
        />

        {/* Team Color Picker */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400">Primary</label>
            <input
              type="color"
              value={teamColors.away.primary}
              onChange={(e) => setTeamColors('away', { primary: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400">Text</label>
            <input
              type="color"
              value={teamColors.away.secondary}
              onChange={(e) => setTeamColors('away', { secondary: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <button
            onClick={() => clearTeam('away')}
            disabled={awayPlayers.length === 0}
            className="ml-auto px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Setup</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              handleLoadFormation('home', FORMATIONS[0]) // 4-4-2
              handleLoadFormation('away', FORMATIONS[1]) // 4-3-3
            }}
            className="w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            4-4-2 vs 4-3-3
          </button>
          <button
            onClick={() => {
              handleLoadFormation('home', FORMATIONS[2]) // 4-2-3-1
              handleLoadFormation('away', FORMATIONS[3]) // 3-5-2
            }}
            className="w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            4-2-3-1 vs 3-5-2
          </button>
        </div>
        <button
          onClick={() => {
            clearTeam('home')
            clearTeam('away')
          }}
          disabled={players.length === 0}
          className="w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
        >
          Clear All Players
        </button>
      </div>
    </div>
  )
}
