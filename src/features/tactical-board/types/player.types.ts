// Player types for the tactical board

export type Team = 'home' | 'away'
export type PlayerSize = 'small' | 'large'

export interface Player {
  id: string
  // Position on canvas (pixels)
  x: number
  y: number
  // Player info
  number: number
  name: string
  team: Team
  positionCode: string // GK, CB, CM, etc.
  // Appearance
  size: PlayerSize
  rotation: number // Degrees
  primaryColor: string
  secondaryColor: string
  // Movement indicator arrow
  movementArrow?: {
    direction: number // Angle in degrees (0 = up, 90 = right)
    length: number // Length in pixels
  }
  // State
  isSelected: boolean
  isDragging: boolean
  // For animation ghosting
  isGhost?: boolean
  opacity?: number
}

export interface PlayerCreateInput {
  x: number
  y: number
  team: Team
  number?: number
  name?: string
  positionCode?: string
  size?: PlayerSize
  primaryColor?: string
  secondaryColor?: string
}

export interface PlayerUpdateInput {
  x?: number
  y?: number
  number?: number
  name?: string
  positionCode?: string
  size?: PlayerSize
  rotation?: number
  primaryColor?: string
  secondaryColor?: string
  movementArrow?: {
    direction: number
    length: number
  } | null
  isSelected?: boolean
  isDragging?: boolean
}

// Ball
export interface Ball {
  id: string
  x: number
  y: number
  isSelected: boolean
  isDragging: boolean
}

// Training Equipment Types
export type EquipmentType = 'cone' | 'mannequin' | 'pole' | 'ladder' | 'hurdle'

export type ConeColor = 'red' | 'yellow' | 'orange' | 'blue' | 'green' | 'white'

export interface Equipment {
  id: string
  type: EquipmentType
  x: number
  y: number
  rotation: number
  isSelected: boolean
  isDragging: boolean
  // Type-specific properties
  color?: ConeColor // For cones
  height?: 'short' | 'tall' // For mannequins/poles
}

export interface EquipmentCreateInput {
  type: EquipmentType
  x: number
  y: number
  rotation?: number
  color?: ConeColor
  height?: 'short' | 'tall'
}
