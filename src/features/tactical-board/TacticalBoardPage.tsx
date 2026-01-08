import { useState, useRef, useEffect, useCallback } from 'react'
import { TacticalCanvas, type TacticalCanvasRef } from './components/Canvas'
import { MainToolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { PlayerDialog } from './components/Player'
import { AnimationTimeline } from './components/Timeline'
import { SaveExportDialog, KeyboardShortcutsModal, ShareDialog, ExportAnimationDialog, FormationComparisonModal } from './components/Dialogs'
import { ToastContainer, useToast, OnboardingTutorial } from './components/UI'
import { useKeyboardShortcuts, useTheme } from './hooks'
import { useTacticalBoardStore, useEditingPlayer, useCanvasState } from './store'
import type { PitchView } from './constants'

// Icons for header controls
const icons = {
  undo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  ),
  zoomIn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  zoomOut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
}

export default function TacticalBoardPage() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  const canvasRef = useRef<TacticalCanvasRef>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveDialogTab, setSaveDialogTab] = useState<'save' | 'load' | 'export'>('save')
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [exportAnimationOpen, setExportAnimationOpen] = useState(false)
  const [comparisonOpen, setComparisonOpen] = useState(false)

  // Theme hook
  const { isDark, toggleTheme } = useTheme()

  // Toast notifications
  const { toasts, dismissToast, showUndo, showRedo } = useToast()

  // Listen for undo/redo to show toasts
  const historyLength = useTacticalBoardStore((state) => state.history.past.length)
  const futureLength = useTacticalBoardStore((state) => state.history.future.length)
  const prevHistoryRef = useRef({ past: historyLength, future: futureLength })

  useEffect(() => {
    const prev = prevHistoryRef.current
    if (historyLength < prev.past && futureLength > prev.future) {
      showUndo()
    } else if (historyLength > prev.past && futureLength < prev.future) {
      showRedo()
    }
    prevHistoryRef.current = { past: historyLength, future: futureLength }
  }, [historyLength, futureLength, showUndo, showRedo])

  // Keyboard shortcut for help modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      setShortcutsOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const { toggleTimeline, setEditingPlayer, setPitchView, undo, redo, deleteSelected, setZoom } = useTacticalBoardStore()
  const timelineOpen = useTacticalBoardStore((state) => state.ui.timelineOpen)
  const zoom = useTacticalBoardStore((state) => state.canvas.zoom)
  const selectedPlayerIds = useTacticalBoardStore((state) => state.selectedPlayerIds)
  const selectedDrawingIds = useTacticalBoardStore((state) => state.selectedDrawingIds)
  const selectedEquipmentIds = useTacticalBoardStore((state) => state.selectedEquipmentIds)
  const hasSelection = selectedPlayerIds.length > 0 || selectedDrawingIds.length > 0 || selectedEquipmentIds.length > 0
  const editingPlayer = useEditingPlayer()
  const canvasState = useCanvasState()

  const handlePitchViewChange = (view: PitchView) => {
    setPitchView(view)
  }

  const openSaveDialog = (tab: 'save' | 'load' | 'export') => {
    setSaveDialogTab(tab)
    setSaveDialogOpen(true)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Tactical Board</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Create and share soccer tactics</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Pitch View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => handlePitchViewChange('vertical')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  canvasState.pitchView === 'vertical'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                title="Vertical full pitch"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="6" y="3" width="12" height="18" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => handlePitchViewChange('half')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  canvasState.pitchView === 'half'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                title="Half pitch (vertical)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="6" y="3" width="12" height="9" rx="1" />
                  <line x1="6" y1="12" x2="18" y2="12" strokeDasharray="2,2" />
                </svg>
              </button>
              <button
                onClick={() => handlePitchViewChange('full')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  canvasState.pitchView === 'full'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                title="Horizontal full pitch"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="6" width="18" height="12" rx="1" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Actions (Undo/Redo/Delete) */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                {icons.undo}
              </button>
              <button
                onClick={redo}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                {icons.redo}
              </button>
              <button
                onClick={deleteSelected}
                disabled={!hasSelection}
                className={`p-2 rounded-lg transition-colors ${
                  hasSelection
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
                title="Delete Selected (Del)"
              >
                {icons.trash}
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(zoom - 0.1)}
                disabled={zoom <= 0.25}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Zoom Out"
              >
                {icons.zoomOut}
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(zoom + 0.1)}
                disabled={zoom >= 3}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Zoom In"
              >
                {icons.zoomIn}
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={toggleTimeline}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${timelineOpen ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'}
              `}
            >
              {timelineOpen ? 'Hide Timeline' : 'Timeline'}
            </button>
            <button
              onClick={() => openSaveDialog('save')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShareDialogOpen(true)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
            <button
              onClick={() => openSaveDialog('export')}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
              Export
            </button>
            <button
              onClick={() => setExportAnimationOpen(true)}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors flex items-center gap-1"
              title="Export animation as GIF"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              GIF
            </button>
            <button
              onClick={() => setComparisonOpen(true)}
              className="p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              title="Compare formations"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">
        {/* Left Toolbar */}
        <aside className="flex-shrink-0 overflow-y-auto max-h-full">
          <MainToolbar />
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 flex items-center justify-center min-w-0 min-h-0">
          <TacticalCanvas ref={canvasRef} />
        </main>

        {/* Right Sidebar */}
        <aside className="flex-shrink-0 overflow-y-auto max-h-full">
          <Sidebar />
        </aside>
      </div>

      {/* Timeline (Animation) */}
      {timelineOpen && (
        <div className="flex-shrink-0 px-2 pb-2">
          <AnimationTimeline />
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4">
        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
          </svg>
        </button>
      </div>

      {/* Player Edit Dialog */}
      {editingPlayer && (
        <PlayerDialog
          player={editingPlayer}
          isOpen={true}
          onClose={() => setEditingPlayer(null)}
        />
      )}

      {/* Save/Export Dialog */}
      <SaveExportDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        initialTab={saveDialogTab}
        stageRef={{ current: canvasRef.current?.getStage() ?? null }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />

      {/* Export Animation Dialog */}
      <ExportAnimationDialog
        isOpen={exportAnimationOpen}
        onClose={() => setExportAnimationOpen(false)}
        stageRef={{ current: canvasRef.current?.getStage() ?? null }}
      />

      {/* Formation Comparison Modal */}
      <FormationComparisonModal
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
