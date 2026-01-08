// Comments and annotations system

export interface Comment {
  id: string
  x: number
  y: number
  text: string
  author: string
  createdAt: number
  color: string
  resolved: boolean
}

export interface Annotation {
  id: string
  tacticId: string
  comments: Comment[]
  notes: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'tactical-board-annotations'

// Get all annotations from storage
export function getAnnotations(): Record<string, Annotation> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Get annotation for a specific tactic
export function getAnnotation(tacticId: string): Annotation | null {
  const annotations = getAnnotations()
  return annotations[tacticId] || null
}

// Save annotation
export function saveAnnotation(annotation: Annotation): void {
  const annotations = getAnnotations()
  annotations[annotation.tacticId] = {
    ...annotation,
    updatedAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations))
}

// Create new annotation
export function createAnnotation(tacticId: string): Annotation {
  return {
    id: `ann-${Date.now()}`,
    tacticId,
    comments: [],
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// Add comment to annotation
export function addComment(
  tacticId: string,
  x: number,
  y: number,
  text: string,
  author: string = 'User',
  color: string = '#3b82f6'
): Comment {
  let annotation = getAnnotation(tacticId)
  if (!annotation) {
    annotation = createAnnotation(tacticId)
  }

  const comment: Comment = {
    id: `comment-${Date.now()}`,
    x,
    y,
    text,
    author,
    createdAt: Date.now(),
    color,
    resolved: false,
  }

  annotation.comments.push(comment)
  saveAnnotation(annotation)

  return comment
}

// Update comment
export function updateComment(tacticId: string, commentId: string, updates: Partial<Comment>): void {
  const annotation = getAnnotation(tacticId)
  if (!annotation) return

  const commentIndex = annotation.comments.findIndex((c) => c.id === commentId)
  if (commentIndex === -1) return

  annotation.comments[commentIndex] = {
    ...annotation.comments[commentIndex],
    ...updates,
  }
  saveAnnotation(annotation)
}

// Delete comment
export function deleteComment(tacticId: string, commentId: string): void {
  const annotation = getAnnotation(tacticId)
  if (!annotation) return

  annotation.comments = annotation.comments.filter((c) => c.id !== commentId)
  saveAnnotation(annotation)
}

// Update notes
export function updateNotes(tacticId: string, notes: string): void {
  let annotation = getAnnotation(tacticId)
  if (!annotation) {
    annotation = createAnnotation(tacticId)
  }
  annotation.notes = notes
  saveAnnotation(annotation)
}

// Resolve/unresolve comment
export function toggleCommentResolved(tacticId: string, commentId: string): void {
  const annotation = getAnnotation(tacticId)
  if (!annotation) return

  const comment = annotation.comments.find((c) => c.id === commentId)
  if (!comment) return

  comment.resolved = !comment.resolved
  saveAnnotation(annotation)
}

// Delete annotation
export function deleteAnnotation(tacticId: string): void {
  const annotations = getAnnotations()
  delete annotations[tacticId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations))
}
