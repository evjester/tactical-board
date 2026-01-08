import { useEffect } from 'react'
import { useTacticalBoardStore } from '../store'

export function useKeyboardShortcuts() {
  const {
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    setZoom,
    deselectAll,
  } = useTacticalBoardStore()

  const zoom = useTacticalBoardStore((state) => state.canvas.zoom)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      const isMeta = e.metaKey || e.ctrlKey

      // Undo: Ctrl/Cmd + Z
      if (isMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (isMeta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }

      // Zoom In: Ctrl/Cmd + Plus
      if (isMeta && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        setZoom(Math.min(3, zoom + 0.1))
        return
      }

      // Zoom Out: Ctrl/Cmd + Minus
      if (isMeta && e.key === '-') {
        e.preventDefault()
        setZoom(Math.max(0.25, zoom - 0.1))
        return
      }

      // Reset Zoom: Ctrl/Cmd + 0
      if (isMeta && e.key === '0') {
        e.preventDefault()
        setZoom(1)
        return
      }

      // Delete selected: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }

      // Escape: Deselect all
      if (e.key === 'Escape') {
        e.preventDefault()
        deselectAll()
        setActiveTool('select')
        return
      }

      // Tool shortcuts (only when no modifier keys)
      if (!isMeta && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select')
            break
          case ' ': // Spacebar for pan
            e.preventDefault()
            setActiveTool('pan')
            break
          case '1':
            setActiveTool('homePlayer')
            break
          case '2':
            setActiveTool('awayPlayer')
            break
          case 'b':
            setActiveTool('ball')
            break
          case 'l':
            setActiveTool('line')
            break
          case 'a':
            setActiveTool('arrow')
            break
          case 'p':
            setActiveTool('freehand')
            break
          case 'r':
            setActiveTool('rectangle')
            break
          case 'c':
            setActiveTool('ellipse')
            break
          case 't':
            setActiveTool('text')
            break
          case 'e':
            setActiveTool('eraser')
            break
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Return to select when spacebar is released (pan mode)
      if (e.key === ' ') {
        const activeTool = useTacticalBoardStore.getState().ui.activeTool
        if (activeTool === 'pan') {
          setActiveTool('select')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [zoom, setActiveTool, undo, redo, deleteSelected, setZoom, deselectAll])
}
