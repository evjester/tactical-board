import { useState } from 'react'
import { useTacticalBoardStore } from '../../store'
import {
  allSetPieceTemplates,
  categoryLabels,
  type SetPieceTemplate,
} from '../../constants/setPieceTemplates'

type Category = SetPieceTemplate['category']

const categoryIcons: Record<Category, JSX.Element> = {
  corner: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M3 3v18h18" />
      <circle cx="6" cy="6" r="3" />
    </svg>
  ),
  freeKick: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  penalty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="4" y="2" width="16" height="8" rx="1" />
      <circle cx="12" cy="14" r="3" />
    </svg>
  ),
  throwIn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M12 3v12M8 8l4-5 4 5" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  ),
  goalKick: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="6" y="14" width="12" height="8" rx="1" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  kickoff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  ),
}

export function SetPieceTemplates() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const { applySetPieceTemplate } = useTacticalBoardStore()

  const categories: Category[] = ['corner', 'freeKick', 'penalty', 'goalKick', 'throwIn', 'kickoff']

  const filteredTemplates =
    selectedCategory === 'all'
      ? allSetPieceTemplates
      : allSetPieceTemplates.filter((t) => t.category === selectedCategory)

  const handleApplyTemplate = (template: SetPieceTemplate) => {
    applySetPieceTemplate({
      homePositions: template.homePositions,
      awayPositions: template.awayPositions,
      ballPosition: template.ballPosition,
    })
  }

  return (
    <div className="p-3 space-y-4">
      {/* Category Filter */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Category</label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
              title={categoryLabels[cat]}
            >
              {categoryIcons[cat]}
              <span className="hidden sm:inline">{categoryLabels[cat]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500">
          Templates ({filteredTemplates.length})
        </label>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{categoryIcons[template.category]}</span>
                    <h4 className="text-sm font-medium text-gray-800 truncate">{template.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>{template.homePositions.length} home</span>
                    <span>{template.awayPositions.length} away</span>
                  </div>
                </div>
                <button
                  onClick={() => handleApplyTemplate(template)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  title="Apply this template to the pitch"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
        <p>Templates will replace all players and ball on the pitch. Use Ctrl+Z to undo.</p>
      </div>
    </div>
  )
}
