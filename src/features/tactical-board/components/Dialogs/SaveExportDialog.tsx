import { useState, useRef } from 'react'
import { useTacticalBoardStore } from '../../store'
import {
  getSavedTactics,
  saveTactic,
  deleteTactic,
  createSavedTactic,
  downloadTacticAsJson,
  readFileAsText,
  importFromJson,
  type SavedTactic,
  type TacticData,
} from '../../utils'

interface SaveExportDialogProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'save' | 'load' | 'export'
  stageRef?: React.RefObject<any>
}

type TabType = 'save' | 'load' | 'export'

export function SaveExportDialog({ isOpen, onClose, initialTab = 'save', stageRef }: SaveExportDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [tacticName, setTacticName] = useState('')
  const [savedTactics, setSavedTactics] = useState<SavedTactic[]>(() => getSavedTactics())
  const [currentTacticId, setCurrentTacticId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const store = useTacticalBoardStore()

  const getTacticData = (): TacticData => ({
    players: store.players,
    ball: store.ball,
    drawings: store.drawings,
    animation: {
      frames: store.animation.frames,
    },
    canvas: {
      pitchView: store.canvas.pitchView,
      pitchTheme: store.canvas.pitchTheme,
    },
    teamColors: store.teamColors,
  })

  const handleSave = () => {
    if (!tacticName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for your tactic' })
      return
    }

    const data = getTacticData()
    const tactic = createSavedTactic(tacticName.trim(), data, currentTacticId ?? undefined)

    if (saveTactic(tactic)) {
      setCurrentTacticId(tactic.id)
      setSavedTactics(getSavedTactics())
      setMessage({ type: 'success', text: 'Tactic saved successfully!' })
      setTimeout(() => setMessage(null), 2000)
    } else {
      setMessage({ type: 'error', text: 'Failed to save tactic' })
    }
  }

  const handleLoad = (tactic: SavedTactic) => {
    const { data } = tactic

    // Clear current state and load new data
    store.clearHistory()

    // Load players
    useTacticalBoardStore.setState((state) => ({
      ...state,
      players: data.players,
      ball: data.ball,
      drawings: data.drawings,
      animation: {
        ...state.animation,
        frames: data.animation.frames,
        currentFrameIndex: 0,
        isPlaying: false,
      },
      canvas: {
        ...state.canvas,
        pitchView: data.canvas.pitchView,
        pitchTheme: data.canvas.pitchTheme,
      },
      teamColors: data.teamColors,
      selectedPlayerIds: [],
      selectedDrawingIds: [],
    }))

    setCurrentTacticId(tactic.id)
    setTacticName(tactic.name)
    setMessage({ type: 'success', text: `Loaded "${tactic.name}"` })
    setTimeout(() => {
      setMessage(null)
      onClose()
    }, 1000)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tactic?')) {
      if (deleteTactic(id)) {
        setSavedTactics(getSavedTactics())
        if (currentTacticId === id) {
          setCurrentTacticId(null)
          setTacticName('')
        }
        setMessage({ type: 'success', text: 'Tactic deleted' })
        setTimeout(() => setMessage(null), 2000)
      }
    }
  }

  const handleExportJson = () => {
    if (!tacticName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for export' })
      return
    }
    const data = getTacticData()
    const tactic = createSavedTactic(tacticName.trim(), data)
    downloadTacticAsJson(tactic)
    setMessage({ type: 'success', text: 'JSON exported!' })
    setTimeout(() => setMessage(null), 2000)
  }

  const handleExportPng = async () => {
    if (!stageRef?.current) {
      setMessage({ type: 'error', text: 'Canvas not available' })
      return
    }

    try {
      const stage = stageRef.current
      const dataUrl = stage.toDataURL({ pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `${tacticName.trim() || 'tactic'}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setMessage({ type: 'success', text: 'PNG exported!' })
      setTimeout(() => setMessage(null), 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export PNG' })
    }
  }

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await readFileAsText(file)
      const tactic = importFromJson(content)
      if (tactic) {
        if (saveTactic(tactic)) {
          setSavedTactics(getSavedTactics())
          setMessage({ type: 'success', text: `Imported "${tactic.name}"` })
          setTimeout(() => setMessage(null), 2000)
        }
      } else {
        setMessage({ type: 'error', text: 'Invalid tactic file' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to read file' })
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Save & Export</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['save', 'load', 'export'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors
                ${activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Message */}
          {message && (
            <div
              className={`mb-4 px-3 py-2 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Tab */}
          {activeTab === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tactic Name</label>
                <input
                  type="text"
                  value={tacticName}
                  onChange={(e) => setTacticName(e.target.value)}
                  placeholder="e.g., Counter Attack Setup"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {currentTacticId ? 'Update Tactic' : 'Save Tactic'}
              </button>
              {currentTacticId && (
                <p className="text-xs text-gray-500 text-center">
                  Currently editing a saved tactic. Save to update it.
                </p>
              )}
            </div>
          )}

          {/* Load Tab */}
          {activeTab === 'load' && (
            <div className="space-y-4">
              {savedTactics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <p>No saved tactics yet</p>
                  <p className="text-sm mt-1">Save your first tactic to see it here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedTactics.map((tactic) => (
                    <div
                      key={tactic.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
                        ${currentTacticId === tactic.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleLoad(tactic)}
                    >
                      <div>
                        <p className="font-medium text-gray-800">{tactic.name}</p>
                        <p className="text-xs text-gray-500">
                          {tactic.data.players.length} players • Updated {formatDate(tactic.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(tactic.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19,6 v14a2,2 0 01-2,2H7a2,2 0 01-2-2V6m3,0V4a2,2 0 012-2h4a2,2 0 012,2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Import button */}
              <div className="pt-2 border-t border-gray-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Import from JSON File
                </button>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Export Name</label>
                <input
                  type="text"
                  value={tacticName}
                  onChange={(e) => setTacticName(e.target.value)}
                  placeholder="e.g., Counter Attack Setup"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportPng}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                  <span className="font-medium">PNG Image</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14,2 H6a2,2 0 00-2,2v16a2,2 0 002,2h12a2,2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span className="font-medium">JSON File</span>
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                PNG exports the current view. JSON exports all data including animations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
