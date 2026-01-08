import { useTacticalBoardStore, useUIState } from '../../store'
import { FormationPanel } from './FormationPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { SetPieceTemplates } from './SetPieceTemplates'
import { LayersPanel } from './LayersPanel'

const tabIcons = {
  formations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="19" cy="10" r="2" />
      <circle cx="8" cy="16" r="2" />
      <circle cx="16" cy="16" r="2" />
      <circle cx="12" cy="20" r="2" />
    </svg>
  ),
  templates: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 3v18h18" />
      <circle cx="8" cy="8" r="2" />
      <path d="M14 6l4 4" />
      <path d="M10 14l6-6" />
    </svg>
  ),
  properties: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polygon points="12,2 2,7 12,12 22,7" />
      <polyline points="2,17 12,22 22,17" />
      <polyline points="2,12 12,17 22,12" />
    </svg>
  ),
}

export function Sidebar() {
  const ui = useUIState()
  const { setSidebarTab, toggleSidebar } = useTacticalBoardStore()

  if (!ui.sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
        title="Open Sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>
    )
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-white">
          {ui.sidebarTab === 'formations' && 'Formations'}
          {ui.sidebarTab === 'templates' && 'Set Pieces'}
          {ui.sidebarTab === 'properties' && 'Properties'}
          {ui.sidebarTab === 'layers' && 'Layers'}
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          title="Close Sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['formations', 'templates', 'properties', 'layers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSidebarTab(tab)}
            className={`
              flex-1 p-3 flex items-center justify-center transition-colors
              ${ui.sidebarTab === tab ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
            `}
            title={tab.charAt(0).toUpperCase() + tab.slice(1)}
          >
            {tabIcons[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {ui.sidebarTab === 'formations' && <FormationPanel />}
        {ui.sidebarTab === 'templates' && <SetPieceTemplates />}
        {ui.sidebarTab === 'properties' && <PropertiesPanel />}
        {ui.sidebarTab === 'layers' && <LayersPanel />}
      </div>
    </div>
  )
}
