import { useState } from 'react'
import { useTacticalBoardStore, useUIState } from '../../store'
import type { ToolType } from '../../types'

const toolGroups = {
  select: { icon: 'select', tools: ['select', 'pan'] as ToolType[] },
  players: { icon: 'player', tools: ['homePlayer', 'awayPlayer', 'ball'] as ToolType[] },
  draw: { icon: 'draw', tools: ['line', 'arrow', 'curvedArrow', 'freehand'] as ToolType[] },
  shapes: { icon: 'shapes', tools: ['rectangle', 'ellipse', 'text'] as ToolType[] },
}

const icons: Record<string, JSX.Element> = {
  select: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
  ),
  player: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  draw: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    </svg>
  ),
  shapes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  undo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  ),
}

export function MobileToolbar() {
  const ui = useUIState()
  const { setActiveTool, undo, redo } = useTacticalBoardStore()
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const handleGroupClick = (groupKey: string) => {
    if (activeGroup === groupKey) {
      setActiveGroup(null)
    } else {
      setActiveGroup(groupKey)
      // Set the first tool in the group as active
      const group = toolGroups[groupKey as keyof typeof toolGroups]
      if (group) {
        setActiveTool(group.tools[0])
      }
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
      <div className="flex items-center justify-around p-2">
        {Object.entries(toolGroups).map(([key, group]) => (
          <button
            key={key}
            onClick={() => handleGroupClick(key)}
            className={`
              p-3 rounded-xl touch-manipulation transition-colors
              ${group.tools.includes(ui.activeTool) ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}
            `}
          >
            {icons[group.icon]}
          </button>
        ))}
        <button
          onClick={undo}
          className="p-3 rounded-xl touch-manipulation text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700"
        >
          {icons.undo}
        </button>
        <button
          onClick={redo}
          className="p-3 rounded-xl touch-manipulation text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700"
        >
          {icons.redo}
        </button>
      </div>

      {/* Expanded tool group */}
      {activeGroup && (
        <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center justify-center gap-2">
            {toolGroups[activeGroup as keyof typeof toolGroups]?.tools.map((tool) => (
              <button
                key={tool}
                onClick={() => {
                  setActiveTool(tool)
                  setActiveGroup(null)
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium touch-manipulation transition-colors
                  ${ui.activeTool === tool ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}
                `}
              >
                {tool.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
