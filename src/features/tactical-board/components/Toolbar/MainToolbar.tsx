import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTacticalBoardStore, useUIState, useTeamColors } from '../../store'
import { DRAWING_COLORS, STROKE_WIDTHS } from '../../constants'

// Tool descriptions for help tooltips
const toolDescriptions: Record<string, { name: string; description: string; shortcut?: string }> = {
  select: { name: 'Select', description: 'Click to select players and drawings. Drag to move them.', shortcut: 'V' },
  pan: { name: 'Pan', description: 'Click and drag to pan around the canvas.', shortcut: 'Space' },
  homePlayer: { name: 'Home Player', description: 'Click on the pitch to add a home team player.', shortcut: '1' },
  awayPlayer: { name: 'Away Player', description: 'Click on the pitch to add an away team player.', shortcut: '2' },
  ball: { name: 'Ball', description: 'Click on the pitch to place the ball.', shortcut: 'B' },
  line: { name: 'Line', description: 'Draw straight lines to show passing lanes.', shortcut: 'L' },
  arrow: { name: 'Arrow', description: 'Draw arrows to indicate player movement directions.', shortcut: 'A' },
  dottedArrow: { name: 'Dotted Arrow', description: 'Draw dotted arrows for alternative movement paths.' },
  dashedArrow: { name: 'Dashed Arrow', description: 'Draw dashed arrows for secondary movements.' },
  curve: { name: 'Curve', description: 'Draw curved lines for curved passing lanes.' },
  curvedArrow: { name: 'Curved Arrow', description: 'Draw curved arrows for curved movement paths.' },
  freehand: { name: 'Freehand', description: 'Draw freely to annotate the pitch.', shortcut: 'P' },
  rectangle: { name: 'Rectangle', description: 'Draw rectangles to highlight areas.', shortcut: 'R' },
  ellipse: { name: 'Ellipse', description: 'Draw ellipses to mark zones.', shortcut: 'C' },
  triangle: { name: 'Triangle', description: 'Draw triangles for tactical shapes.' },
  text: { name: 'Text', description: 'Add text annotations to the pitch.', shortcut: 'T' },
  zone: { name: 'Zone Highlight', description: 'Click to add polygon points. Double-click or click on the first point to close the shape.' },
  freehandZone: { name: 'Freehand Zone', description: 'Draw any shape freehand - it will become a filled zone when you release.', shortcut: 'Z' },
  offsideLine: { name: 'Offside Line', description: 'Draw a horizontal line to mark offside positions.' },
  measurement: { name: 'Measurement', description: 'Measure distances between points on the pitch.' },
  pressingTrigger: { name: 'Pressing Trigger', description: 'Mark trigger zones for pressing.' },
  playerRun: { name: 'Player Run', description: 'Draw curved player movement paths with arrow at the end.' },
  passingLane: { name: 'Passing Lane', description: 'Draw dashed lines to show potential passing options.' },
  defensiveLine: { name: 'Defensive Line', description: 'Draw a horizontal line segment to show defensive positioning.' },
  highlighter: { name: 'Highlighter', description: 'Draw a semi-transparent wide marker to highlight areas.' },
  sprayArrows: { name: 'Spray Arrows', description: 'Draw multiple arrows from the same starting point.' },
  movementArrow: { name: 'Movement Arrow', description: 'Draw player movement arrows.', shortcut: 'M' },
  eraser: { name: 'Eraser', description: 'Click on drawings to delete them.', shortcut: 'E' },
  cone: { name: 'Cone', description: 'Place training cones on the pitch.' },
  mannequin: { name: 'Mannequin', description: 'Place training mannequins for drills.' },
  pole: { name: 'Pole', description: 'Place agility poles for training exercises.' },
  ladder: { name: 'Agility Ladder', description: 'Place agility ladders for footwork drills.' },
  hurdle: { name: 'Hurdle', description: 'Place hurdles for jumping exercises.' },
}

// Tool icons as SVG components
const icons = {
  select: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
  ),
  pan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="5" y1="19" x2="19" y2="5" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="5" y1="19" x2="19" y2="5" />
      <polyline points="12,5 19,5 19,12" />
    </svg>
  ),
  dottedArrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="5" y1="19" x2="19" y2="5" strokeDasharray="3,3" />
      <polyline points="12,5 19,5 19,12" />
    </svg>
  ),
  curve: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 18 Q 12 2, 20 18" />
    </svg>
  ),
  curvedArrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 18 Q 10 4, 16 10" />
      <polyline points="12,6 16,10 12,14" />
    </svg>
  ),
  triangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polygon points="12,4 21,20 3,20" />
    </svg>
  ),
  freehand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  ellipse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <ellipse cx="12" cy="12" rx="10" ry="6" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="4,7 4,4 20,4 20,7" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13.4 2.8c.8-.8 2-.8 2.8 0l5 5c.8.8.8 2 0 2.8L12 20" />
      <path d="M6 11l8 8" />
    </svg>
  ),
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
  zone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 4 L20 4 L18 12 L20 20 L4 20 L6 12 Z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
  offsideLine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="4,2" />
      <circle cx="6" cy="8" r="3" fill="none" />
      <circle cx="18" cy="16" r="3" fill="none" />
    </svg>
  ),
  measurement: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="4" y1="20" x2="20" y2="4" />
      <line x1="4" y1="17" x2="4" y2="20" />
      <line x1="4" y1="20" x2="7" y2="20" />
      <line x1="20" y1="4" x2="20" y2="7" />
      <line x1="17" y1="4" x2="20" y2="4" />
    </svg>
  ),
  pressingTrigger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="12" cy="12" r="8" strokeDasharray="4,2" />
      <path d="M12 8 L12 12 L16 12" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),
  movementArrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="8" cy="16" r="5" fill="#dc2626" fillOpacity="0.5" stroke="#dc2626" />
      <path d="M10 14 L18 6" stroke="currentColor" />
      <polyline points="14,6 18,6 18,10" stroke="currentColor" />
    </svg>
  ),
  ball: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#333333" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#333333" />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  freehandZone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 8 Q 8 4, 12 6 T 20 8 Q 22 14, 18 18 Q 12 22, 6 18 Q 2 14, 4 8 Z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
  playerRun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="6" cy="16" r="4" fill="currentColor" fillOpacity="0.3" />
      <path d="M8 14 Q 14 10, 18 6" strokeDasharray="3,2" />
      <polyline points="15,4 18,6 16,10" />
    </svg>
  ),
  passingLane: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="4" y1="18" x2="20" y2="6" strokeDasharray="4,2" />
      <circle cx="4" cy="18" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="20" cy="6" r="2" fill="currentColor" fillOpacity="0.5" />
    </svg>
  ),
  defensiveLine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="3" />
      <line x1="4" y1="8" x2="4" y2="16" />
      <line x1="20" y1="8" x2="20" y2="16" />
    </svg>
  ),
  highlighter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 16 Q 8 8, 12 12 T 20 8" strokeWidth="5" opacity="0.4" strokeLinecap="round" />
    </svg>
  ),
  sprayArrows: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="6" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
      <line x1="8" y1="11" x2="18" y2="5" />
      <polyline points="15,4 18,5 17,9" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <polyline points="17,10 20,12 17,14" />
      <line x1="8" y1="13" x2="18" y2="19" />
      <polyline points="17,16 18,19 15,20" />
    </svg>
  ),
  cone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polygon points="12,4 20,20 4,20" fill="#f97316" fillOpacity="0.8" stroke="#c2410c" />
      <line x1="8" y1="14" x2="16" y2="14" stroke="white" strokeWidth="2" />
    </svg>
  ),
  mannequin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="12" cy="6" r="3" fill="#f5d0c5" stroke="#d4a59a" />
      <rect x="9" y="9" width="6" height="10" rx="2" fill="#2563eb" stroke="#1d4ed8" />
      <ellipse cx="12" cy="21" rx="5" ry="2" fill="#4b5563" stroke="#374151" />
    </svg>
  ),
  pole: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="10" y="3" width="4" height="16" rx="1" fill="#f97316" stroke="#c2410c" />
      <ellipse cx="12" cy="21" rx="4" ry="2" fill="#4b5563" stroke="#374151" />
    </svg>
  ),
  ladder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="6" y1="4" x2="6" y2="20" stroke="#eab308" strokeWidth="3" />
      <line x1="18" y1="4" x2="18" y2="20" stroke="#eab308" strokeWidth="3" />
      <line x1="6" y1="7" x2="18" y2="7" stroke="#eab308" strokeWidth="2" />
      <line x1="6" y1="11" x2="18" y2="11" stroke="#eab308" strokeWidth="2" />
      <line x1="6" y1="15" x2="18" y2="15" stroke="#eab308" strokeWidth="2" />
    </svg>
  ),
  hurdle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="4" y1="20" x2="4" y2="10" stroke="#f97316" strokeWidth="3" />
      <line x1="20" y1="20" x2="20" y2="10" stroke="#f97316" strokeWidth="3" />
      <line x1="4" y1="10" x2="20" y2="10" stroke="#f97316" strokeWidth="4" />
    </svg>
  ),
}

interface TooltipProps {
  tool: string
  children: React.ReactNode
}

function Tooltip({ tool, children }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const info = toolDescriptions[tool]

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      })
    }
  }, [show])

  if (!info) return <>{children}</>

  return (
    <div ref={triggerRef} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && createPortal(
        <div
          className="fixed z-[9999] w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="font-semibold mb-1">
            {info.name}
            {info.shortcut && <span className="ml-2 text-gray-400">({info.shortcut})</span>}
          </div>
          <div className="text-gray-300">{info.description}</div>
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
        </div>,
        document.body
      )}
    </div>
  )
}

interface ToolButtonProps {
  tool: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  className?: string
}

function ToolButton({ tool, icon, isActive, onClick, className = '' }: ToolButtonProps) {
  return (
    <Tooltip tool={tool}>
      <button
        onClick={onClick}
        className={`
          p-2 rounded-lg transition-all duration-150 flex items-center justify-center
          ${isActive ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}
          border border-gray-200 dark:border-gray-600
          ${className}
        `}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

interface ToolGroupProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function ToolGroup({ title, children, defaultOpen = true }: ToolGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-1 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          {icons.chevronDown}
        </span>
      </button>
      {isOpen && <div className="space-y-1">{children}</div>}
    </div>
  )
}

export function MainToolbar() {
  const ui = useUIState()
  const teamColors = useTeamColors()
  const {
    setActiveTool,
    setActiveColor,
    setStrokeWidth,
  } = useTacticalBoardStore()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 flex flex-col gap-3 w-40">
      {/* Selection Tools */}
      <ToolGroup title="Select" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-1">
          <ToolButton
            tool="select"
            icon={icons.select}
            isActive={ui.activeTool === 'select'}
            onClick={() => setActiveTool('select')}
            className="w-full"
          />
          <ToolButton
            tool="pan"
            icon={icons.pan}
            isActive={ui.activeTool === 'pan'}
            onClick={() => setActiveTool('pan')}
            className="w-full"
          />
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Player Tools */}
      <ToolGroup title="Players" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-1">
          <Tooltip tool="homePlayer">
            <button
              onClick={() => setActiveTool('homePlayer')}
              className={`
                p-2 rounded-lg transition-all duration-150 border w-full flex items-center justify-center
                ${ui.activeTool === 'homePlayer' ? 'ring-2 ring-blue-500' : ''}
              `}
              style={{ backgroundColor: teamColors.home.primary }}
            >
              <span className="text-xs font-bold" style={{ color: teamColors.home.secondary }}>
                H
              </span>
            </button>
          </Tooltip>
          <Tooltip tool="awayPlayer">
            <button
              onClick={() => setActiveTool('awayPlayer')}
              className={`
                p-2 rounded-lg transition-all duration-150 border w-full flex items-center justify-center
                ${ui.activeTool === 'awayPlayer' ? 'ring-2 ring-blue-500' : ''}
              `}
              style={{ backgroundColor: teamColors.away.primary }}
            >
              <span className="text-xs font-bold" style={{ color: teamColors.away.secondary }}>
                A
              </span>
            </button>
          </Tooltip>
          <ToolButton
            tool="ball"
            icon={icons.ball}
            isActive={ui.activeTool === 'ball'}
            onClick={() => setActiveTool('ball')}
            className="w-full col-span-2"
          />
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Equipment Tools */}
      <ToolGroup title="Equipment" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1">
          <ToolButton
            tool="cone"
            icon={icons.cone}
            isActive={ui.activeTool === 'cone'}
            onClick={() => setActiveTool('cone')}
            className="w-full"
          />
          <ToolButton
            tool="mannequin"
            icon={icons.mannequin}
            isActive={ui.activeTool === 'mannequin'}
            onClick={() => setActiveTool('mannequin')}
            className="w-full"
          />
          <ToolButton
            tool="pole"
            icon={icons.pole}
            isActive={ui.activeTool === 'pole'}
            onClick={() => setActiveTool('pole')}
            className="w-full"
          />
          <ToolButton
            tool="ladder"
            icon={icons.ladder}
            isActive={ui.activeTool === 'ladder'}
            onClick={() => setActiveTool('ladder')}
            className="w-full"
          />
          <ToolButton
            tool="hurdle"
            icon={icons.hurdle}
            isActive={ui.activeTool === 'hurdle'}
            onClick={() => setActiveTool('hurdle')}
            className="w-full col-span-2"
          />
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Drawing Tools */}
      <ToolGroup title="Lines" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-1">
          <ToolButton
            tool="arrow"
            icon={icons.arrow}
            isActive={ui.activeTool === 'arrow'}
            onClick={() => setActiveTool('arrow')}
            className="w-full"
          />
          <ToolButton
            tool="line"
            icon={icons.line}
            isActive={ui.activeTool === 'line'}
            onClick={() => setActiveTool('line')}
            className="w-full"
          />
          <ToolButton
            tool="curvedArrow"
            icon={icons.curvedArrow}
            isActive={ui.activeTool === 'curvedArrow'}
            onClick={() => setActiveTool('curvedArrow')}
            className="w-full"
          />
          <ToolButton
            tool="dottedArrow"
            icon={icons.dottedArrow}
            isActive={ui.activeTool === 'dottedArrow'}
            onClick={() => setActiveTool('dottedArrow')}
            className="w-full"
          />
          <ToolButton
            tool="freehand"
            icon={icons.freehand}
            isActive={ui.activeTool === 'freehand'}
            onClick={() => setActiveTool('freehand')}
            className="w-full col-span-2"
          />
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Shape Tools */}
      <ToolGroup title="Shapes" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1">
          <ToolButton
            tool="rectangle"
            icon={icons.rectangle}
            isActive={ui.activeTool === 'rectangle'}
            onClick={() => setActiveTool('rectangle')}
            className="w-full"
          />
          <ToolButton
            tool="ellipse"
            icon={icons.ellipse}
            isActive={ui.activeTool === 'ellipse'}
            onClick={() => setActiveTool('ellipse')}
            className="w-full"
          />
          <ToolButton
            tool="triangle"
            icon={icons.triangle}
            isActive={ui.activeTool === 'triangle'}
            onClick={() => setActiveTool('triangle')}
            className="w-full"
          />
          <ToolButton
            tool="text"
            icon={icons.text}
            isActive={ui.activeTool === 'text'}
            onClick={() => setActiveTool('text')}
            className="w-full"
          />
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Tactical Tools */}
      <ToolGroup title="Tactical" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1">
          <ToolButton
            tool="zone"
            icon={icons.zone}
            isActive={ui.activeTool === 'zone'}
            onClick={() => setActiveTool('zone')}
            className="w-full"
          />
          <ToolButton
            tool="freehandZone"
            icon={icons.freehandZone}
            isActive={ui.activeTool === 'freehandZone'}
            onClick={() => setActiveTool('freehandZone')}
            className="w-full"
          />
          <ToolButton
            tool="playerRun"
            icon={icons.playerRun}
            isActive={ui.activeTool === 'playerRun'}
            onClick={() => setActiveTool('playerRun')}
            className="w-full"
          />
          <ToolButton
            tool="passingLane"
            icon={icons.passingLane}
            isActive={ui.activeTool === 'passingLane'}
            onClick={() => setActiveTool('passingLane')}
            className="w-full"
          />
          <ToolButton
            tool="defensiveLine"
            icon={icons.defensiveLine}
            isActive={ui.activeTool === 'defensiveLine'}
            onClick={() => setActiveTool('defensiveLine')}
            className="w-full"
          />
          <ToolButton
            tool="offsideLine"
            icon={icons.offsideLine}
            isActive={ui.activeTool === 'offsideLine'}
            onClick={() => setActiveTool('offsideLine')}
            className="w-full"
          />
          <ToolButton
            tool="pressingTrigger"
            icon={icons.pressingTrigger}
            isActive={ui.activeTool === 'pressingTrigger'}
            onClick={() => setActiveTool('pressingTrigger')}
            className="w-full"
          />
          <ToolButton
            tool="sprayArrows"
            icon={icons.sprayArrows}
            isActive={ui.activeTool === 'sprayArrows'}
            onClick={() => setActiveTool('sprayArrows')}
            className="w-full"
          />
          <ToolButton
            tool="highlighter"
            icon={icons.highlighter}
            isActive={ui.activeTool === 'highlighter'}
            onClick={() => setActiveTool('highlighter')}
            className="w-full"
          />
          <ToolButton
            tool="measurement"
            icon={icons.measurement}
            isActive={ui.activeTool === 'measurement'}
            onClick={() => setActiveTool('measurement')}
            className="w-full"
          />
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Edit Tools */}
      <ToolGroup title="Edit" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-1">
          <ToolButton
            tool="eraser"
            icon={icons.eraser}
            isActive={ui.activeTool === 'eraser'}
            onClick={() => setActiveTool('eraser')}
            className="w-full col-span-2"
          />
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Color Picker */}
      <ToolGroup title="Color" defaultOpen={true}>
        <div className="grid grid-cols-3 gap-2">
          {DRAWING_COLORS.slice(0, 6).map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all duration-150 mx-auto
                ${ui.activeColor === color ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : 'border-gray-300 hover:scale-105'}
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </ToolGroup>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Stroke Width */}
      <ToolGroup title="Size" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1">
          {STROKE_WIDTHS.slice(0, 4).map((width) => (
            <button
              key={width}
              onClick={() => setStrokeWidth(width)}
              className={`
                w-full h-8 rounded-lg flex items-center justify-center transition-all duration-150
                ${ui.strokeWidth === width ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
              `}
              title={`${width}px`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: Math.min(width + 2, 12), height: Math.min(width + 2, 12) }}
              />
            </button>
          ))}
        </div>
      </ToolGroup>

    </div>
  )
}
