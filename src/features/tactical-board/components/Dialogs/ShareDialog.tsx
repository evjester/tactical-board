import { useState, useEffect } from 'react'
import { useTacticalBoardStore } from '../../store'
import {
  generateShareUrl,
  copyToClipboard,
  getVersionHistory,
  createVersion,
  deleteVersion,
  formatVersionDate,
  type TacticVersion,
} from '../../utils'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  tacticId?: string
}

type Tab = 'share' | 'versions' | 'comments'

export function ShareDialog({ isOpen, onClose, tacticId = 'current' }: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>('share')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [tacticName, setTacticName] = useState('')
  const [versionName, setVersionName] = useState('')
  const [versionDescription, setVersionDescription] = useState('')
  const [versions, setVersions] = useState<TacticVersion[]>([])
  const [notes, setNotes] = useState('')

  const players = useTacticalBoardStore((state) => state.players)
  const ball = useTacticalBoardStore((state) => state.ball)
  const drawings = useTacticalBoardStore((state) => state.drawings)

  // Load versions on open
  useEffect(() => {
    if (isOpen) {
      const history = getVersionHistory(tacticId)
      setVersions(history.versions)
    }
  }, [isOpen, tacticId])

  // Generate share URL
  useEffect(() => {
    if (isOpen && activeTab === 'share') {
      const url = generateShareUrl(players, ball, drawings, tacticName || undefined)
      setShareUrl(url)
    }
  }, [isOpen, activeTab, players, ball, drawings, tacticName])

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateVersion = () => {
    if (!versionName.trim()) return

    createVersion(
      tacticId,
      versionName,
      {
        players: JSON.parse(JSON.stringify(players)),
        ball: ball ? JSON.parse(JSON.stringify(ball)) : null,
        drawings: JSON.parse(JSON.stringify(drawings)),
      },
      versionDescription || undefined
    )

    // Refresh versions list
    const history = getVersionHistory(tacticId)
    setVersions(history.versions)
    setVersionName('')
    setVersionDescription('')
  }

  const handleDeleteVersion = (versionId: string) => {
    deleteVersion(tacticId, versionId)
    const history = getVersionHistory(tacticId)
    setVersions(history.versions)
  }

  const handleRestoreVersion = (version: TacticVersion) => {
    // This would need to be implemented in the store
    // For now, just show an alert
    alert(`Restoring version: ${version.name}\nThis feature requires store integration.`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Share & Collaborate</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['share', 'versions', 'comments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
              `}
            >
              {tab === 'share' && 'Share Link'}
              {tab === 'versions' && 'Versions'}
              {tab === 'comments' && 'Notes'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tactic Name (optional)
                </label>
                <input
                  type="text"
                  value={tacticName}
                  onChange={(e) => setTacticName(e.target.value)}
                  placeholder="My Corner Kick Setup"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-xs"
                  />
                  <button
                    onClick={handleCopy}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${copied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'}
                    `}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Share this link with anyone. They can view and edit the tactic in their browser.
                  The entire tactic is encoded in the URL - no server required!
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Share via:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out my soccer tactic: ${tacticName || 'My Tactic'}`)}`, '_blank')}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Share on Twitter"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-300">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my soccer tactic: ${shareUrl}`)}`, '_blank')}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Share on WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-300">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(`Soccer Tactic: ${tacticName || 'My Tactic'}`)}&body=${encodeURIComponent(`Check out my soccer tactic: ${shareUrl}`)}`, '_blank')}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Share via Email"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-600 dark:text-gray-300">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Save Current Version</h3>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="Version name (e.g., v1.0, Initial setup)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleCreateVersion}
                  disabled={!versionName.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Version
                </button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Version History ({versions.length})
                </h3>
                {versions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No versions saved yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {version.name}
                          </p>
                          {version.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {version.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formatVersionDate(version.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleRestoreVersion(version)}
                            className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            title="Restore"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteVersion(version.id)}
                            className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <polyline points="3,6 5,6 21,6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tactic Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this tactic..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Coming Soon:</strong> Pin comments directly on the pitch by clicking while in comment mode.
                  Comments will be visible to anyone you share the tactic with.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
