// Default colors for teams and UI elements
export const TEAM_COLORS = {
  home: {
    primary: '#dc2626', // Red
    secondary: '#ffffff', // White
  },
  away: {
    primary: '#2563eb', // Blue
    secondary: '#ffffff', // White
  },
} as const

// Pitch theme colors
export const PITCH_THEMES = {
  default: {
    name: 'Classic Green',
    grass: '#2d5a27',
    grassDark: '#1e4d1a',
    lines: '#ffffff',
  },
  modern: {
    name: 'Modern Green',
    grass: '#3a7d32',
    grassDark: '#2d6327',
    lines: '#ffffff',
  },
  dark: {
    name: 'Night Mode',
    grass: '#1a3d17',
    grassDark: '#0f2a0d',
    lines: '#cccccc',
  },
  premium: {
    name: 'Premium',
    grass: '#228b22',
    grassDark: '#1a6b1a',
    lines: '#ffffff',
  },
  championsLeague: {
    name: 'Champions League',
    grass: '#006400',
    grassDark: '#004d00',
    lines: '#ffffff',
  },
  premierLeague: {
    name: 'Premier League',
    grass: '#2e8b57',
    grassDark: '#236b43',
    lines: '#ffffff',
  },
} as const

export type PitchTheme = keyof typeof PITCH_THEMES

// Drawing colors palette
export const DRAWING_COLORS = [
  '#000000', // Black
  '#ffffff', // White
  '#dc2626', // Red
  '#ea580c', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
] as const

// Stroke width options
export const STROKE_WIDTHS = [1, 2, 3, 4, 6, 8, 10] as const

// Player chip colors (for custom teams)
export const PLAYER_COLORS = [
  { name: 'Red', primary: '#dc2626', secondary: '#ffffff' },
  { name: 'Blue', primary: '#2563eb', secondary: '#ffffff' },
  { name: 'Green', primary: '#16a34a', secondary: '#ffffff' },
  { name: 'Yellow', primary: '#eab308', secondary: '#000000' },
  { name: 'Orange', primary: '#ea580c', secondary: '#ffffff' },
  { name: 'Purple', primary: '#9333ea', secondary: '#ffffff' },
  { name: 'Pink', primary: '#db2777', secondary: '#ffffff' },
  { name: 'Cyan', primary: '#06b6d4', secondary: '#000000' },
  { name: 'Black', primary: '#171717', secondary: '#ffffff' },
  { name: 'White', primary: '#ffffff', secondary: '#000000' },
] as const
