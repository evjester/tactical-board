# Soccer Tactical Board

A comprehensive soccer/football tactical board application built with React, TypeScript, Tailwind CSS, and React-Konva.

## Features

- Interactive pitch with vertical/horizontal orientations
- Drag-and-drop player positioning
- Multiple formation presets (4-4-2, 4-3-3, 3-5-2, etc.)
- Drawing tools (lines, arrows, curved arrows, rectangles, circles, freehand)
- Advanced tactical tools (zones, offside lines, pressing triggers, measurements)
- Set piece templates (corners, free kicks, penalties, etc.)
- Animation timeline with keyframe support
- Ghost trails visualization for player movement paths
- Export animations as GIF
- Animation presets (attack patterns, defensive setups, transitions)
- Save/export functionality (PNG, JSON, GIF)
- Share tactics via URL with social sharing
- Version history with local snapshots
- Custom formation templates
- Formation comparison view
- Dark mode support
- Touch-friendly mobile interface
- Undo/redo with visual feedback
- Onboarding tutorial for new users
- Accessibility features (ARIA labels, keyboard navigation)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React-Konva** - Canvas rendering
- **Zustand** - State management
- **Immer** - Immutable state updates

---

## Development Phases

### Phase 1: Project Setup & Core Infrastructure (Completed)

- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS
- [x] Set up project structure and folder organization
- [x] Create base types and interfaces
- [x] Set up Zustand store with Immer middleware
- [x] Create pitch constants and dimensions

### Phase 2: Pitch & Basic Elements (Completed)

- [x] Render soccer pitch with proper markings
- [x] Center circle, penalty areas, goal areas
- [x] Corner arcs and penalty arcs
- [x] Player chip components (draggable)
- [x] Ball element
- [x] Basic drawing tools (line, arrow, rectangle, circle)
- [x] Freehand drawing tool
- [x] Curved arrow tool
- [x] Main toolbar with tool selection
- [x] Color picker and stroke width controls

### Phase 3: Player Management & Formations (Completed)

- [x] Player dialog for editing details (number, name, position)
- [x] Position auto-detection based on pitch coordinates
- [x] Formation detection from player positions
- [x] Formation presets (4-4-2, 4-3-3, 3-5-2, 4-2-3-1, etc.)
- [x] Load formation for home/away teams
- [x] Clear team functionality
- [x] Player rotation controls
- [x] Double-click to edit player

### Phase 4: Animation System (Completed)

- [x] Keyframe capture functionality
- [x] Animation timeline component
- [x] Playback controls (play, pause, prev, next)
- [x] Playback speed control (0.25x to 2x)
- [x] Loop toggle
- [x] Interpolation utilities with easing functions
- [x] Frame duration editing
- [x] Delete keyframes
- [x] Progress bar during playback

### Phase 5: Save & Export System (Completed)

- [x] Save tactics to local storage
- [x] Load tactics from local storage
- [x] Export canvas as PNG image
- [x] Export tactics as JSON file
- [x] Import tactics from JSON file
- [x] Save/load/export dialog UI

### Phase 6: Advanced Drawing Tools (Completed)

- [x] Movement arrows tool for player runs
- [x] Zone highlighting (shaded polygon areas)
- [x] Offside line tool (horizontal line across pitch)
- [x] Pressing triggers visualization (press/cover/mark zones)
- [x] Distance measurement tool (shows meters/yards)

### Phase 7: Templates & Presets (Completed)

- [x] Set piece templates (corners, free kicks, penalties, goal kicks, throw-ins, kickoffs)
- [x] Templates sidebar tab with category filtering
- [x] Quick-load templates with one-click apply
- [x] 12+ pre-built tactical scenarios
- [x] Save custom formations as templates
- [x] Formation comparison view

### Phase 8: Collaboration Features (Completed)

- [x] Share tactics via URL (full state encoded in shareable link)
- [x] Comments and annotations (local storage)
- [x] Version history (local snapshots)
- [x] Share dialog with social sharing (Twitter, WhatsApp, Email)
- [ ] Real-time collaboration via WebSocket (Future - requires backend)
- [ ] Team workspaces (Future - requires backend)

### Phase 9: Polish & UX (Completed)

- [x] Keyboard shortcuts help modal (press `?` to open)
- [x] Undo/redo visual feedback (toast notifications)
- [x] Touch and mobile support (larger touch targets, safe area padding)
- [x] Dark mode theme (toggle in header)
- [x] Reduced motion support for accessibility
- [x] Onboarding tutorial (interactive walkthrough for new users)
- [x] Enhanced accessibility (ARIA labels, keyboard navigation utilities)

### Phase 10: Advanced Animation (Completed)

- [x] Export animation as GIF
- [x] Animation path visualization (ghost trails)
- [x] Speed curves per player (multiple easing presets)
- [x] Animation presets (attack patterns, defensive setups, transitions)
- [ ] Export animation as video (MP4/WebM) (Future)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts |
| `V` | Select tool |
| `H` | Pan/Hand tool |
| `P` | Player tool |
| `B` | Ball tool |
| `L` | Line tool |
| `A` | Arrow tool |
| `C` | Curved arrow tool |
| `R` | Rectangle tool |
| `O` | Circle/Ellipse tool |
| `D` | Freehand draw tool |
| `T` | Text tool |
| `G` | Toggle grid |
| `Delete/Backspace` | Delete selected |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Save |
| `Escape` | Deselect all |
| `Space` | Play/Pause animation |
| `K` | Add keyframe |

---

## Project Structure

```
src/
├── features/
│   └── tactical-board/
│       ├── components/
│       │   ├── Canvas/          # Pitch and canvas components
│       │   ├── Player/          # Player chip and dialog
│       │   ├── Toolbar/         # Main toolbar
│       │   ├── Sidebar/         # Properties and formations
│       │   └── Timeline/        # Animation timeline
│       ├── hooks/               # Custom React hooks
│       ├── store/               # Zustand store
│       ├── types/               # TypeScript types
│       ├── utils/               # Utility functions
│       └── constants/           # Configuration constants
├── App.tsx
└── main.tsx
```

---

## License

MIT
