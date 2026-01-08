// Set piece templates for tactical board
// Positions are normalized 0-1 relative to pitch dimensions
// Based on real soccer tactics - researched from FIFA Training Centre, coaching sites

export interface SetPieceTemplate {
  id: string
  name: string
  category: 'corner' | 'freeKick' | 'penalty' | 'throwIn' | 'goalKick' | 'kickoff'
  description: string
  // Player positions - relative coordinates (0-1)
  homePositions: Array<{
    x: number
    y: number
    positionCode: string
    role?: string // Optional role description
  }>
  awayPositions: Array<{
    x: number
    y: number
    positionCode: string
    role?: string
  }>
  // Ball position
  ballPosition?: { x: number; y: number }
  // Optional drawings (arrows, zones)
  drawings?: Array<{
    type: 'arrow' | 'zone' | 'curvedArrow'
    points: number[] // Relative coordinates
    color?: string
  }>
}

// Corner kick templates - Realistic 11v11 formations
export const cornerTemplates: SetPieceTemplate[] = [
  {
    id: 'corner-inswinger-near',
    name: 'Inswinger Near Post',
    category: 'corner',
    description: 'Inswinging corner targeting near post - zonal defense',
    homePositions: [
      // Goalkeeper stays back
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // 2 defenders at halfway line for counter-attack defense
      { x: 0.4, y: 0.50, positionCode: 'CB', role: 'Counter cover' },
      { x: 0.6, y: 0.50, positionCode: 'CB', role: 'Counter cover' },
      // Corner taker
      { x: 0.02, y: 0.02, positionCode: 'RW', role: 'Corner taker' },
      // Short option near corner
      { x: 0.12, y: 0.08, positionCode: 'LM', role: 'Short option' },
      // Attackers in box - near post, 6-yard, penalty spot, far post
      { x: 0.35, y: 0.05, positionCode: 'ST', role: 'Near post run' },
      { x: 0.45, y: 0.04, positionCode: 'CM', role: '6-yard runner' },
      { x: 0.5, y: 0.06, positionCode: 'ST', role: 'Penalty spot' },
      { x: 0.55, y: 0.04, positionCode: 'CM', role: '6-yard runner' },
      { x: 0.68, y: 0.06, positionCode: 'CM', role: 'Far post' },
      // Edge of box for second balls
      { x: 0.5, y: 0.16, positionCode: 'CDM', role: 'Edge - second balls' },
    ],
    awayPositions: [
      // Goalkeeper commands box
      { x: 0.52, y: 0.03, positionCode: 'GK', role: 'Goalkeeper' },
      // Post players
      { x: 0.38, y: 0.02, positionCode: 'CB', role: 'Near post' },
      { x: 0.62, y: 0.02, positionCode: 'CB', role: 'Far post' },
      // Zonal markers in 6-yard box
      { x: 0.42, y: 0.05, positionCode: 'CB', role: 'Zonal - 6 yard' },
      { x: 0.48, y: 0.05, positionCode: 'CDM', role: 'Zonal - 6 yard' },
      { x: 0.54, y: 0.05, positionCode: 'CM', role: 'Zonal - 6 yard' },
      { x: 0.60, y: 0.05, positionCode: 'CM', role: 'Zonal - 6 yard' },
      // Edge of area
      { x: 0.35, y: 0.14, positionCode: 'LM', role: 'Edge - press' },
      { x: 0.65, y: 0.14, positionCode: 'RM', role: 'Edge - press' },
      // Counter-attack players at halfway
      { x: 0.45, y: 0.50, positionCode: 'LW', role: 'Counter-attack' },
      { x: 0.55, y: 0.50, positionCode: 'ST', role: 'Counter-attack' },
    ],
    ballPosition: { x: 0.02, y: 0.02 },
  },
  {
    id: 'corner-outswinger-far',
    name: 'Outswinger Far Post',
    category: 'corner',
    description: 'Outswinging corner to far post for header back across',
    homePositions: [
      // Goalkeeper stays back
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // 2 defenders at halfway for counter defense
      { x: 0.4, y: 0.50, positionCode: 'CB', role: 'Counter cover' },
      { x: 0.6, y: 0.50, positionCode: 'CB', role: 'Counter cover' },
      // Corner taker
      { x: 0.02, y: 0.02, positionCode: 'RW', role: 'Corner taker' },
      // Decoy near post runs
      { x: 0.30, y: 0.06, positionCode: 'LM', role: 'Near post decoy' },
      { x: 0.38, y: 0.05, positionCode: 'CM', role: 'Near post decoy' },
      // Main target far post
      { x: 0.70, y: 0.05, positionCode: 'ST', role: 'Far post target' },
      { x: 0.62, y: 0.06, positionCode: 'ST', role: 'Back post runner' },
      // Central runners
      { x: 0.50, y: 0.06, positionCode: 'CM', role: 'Penalty spot' },
      // Edge of box
      { x: 0.45, y: 0.16, positionCode: 'CDM', role: 'Edge - second balls' },
      { x: 0.58, y: 0.16, positionCode: 'CM', role: 'Edge - second balls' },
    ],
    awayPositions: [
      // Goalkeeper
      { x: 0.52, y: 0.03, positionCode: 'GK', role: 'Goalkeeper' },
      // Post players
      { x: 0.38, y: 0.02, positionCode: 'CB', role: 'Near post' },
      { x: 0.62, y: 0.02, positionCode: 'CB', role: 'Far post' },
      // Zonal/man markers
      { x: 0.44, y: 0.05, positionCode: 'CB', role: 'Marker' },
      { x: 0.50, y: 0.05, positionCode: 'CDM', role: 'Marker' },
      { x: 0.56, y: 0.05, positionCode: 'CM', role: 'Marker' },
      { x: 0.66, y: 0.06, positionCode: 'CM', role: 'Far post marker' },
      // Edge coverage
      { x: 0.40, y: 0.14, positionCode: 'LM', role: 'Edge' },
      { x: 0.60, y: 0.14, positionCode: 'RM', role: 'Edge' },
      // Counter-attack
      { x: 0.48, y: 0.50, positionCode: 'LW', role: 'Counter-attack' },
      { x: 0.52, y: 0.50, positionCode: 'ST', role: 'Counter-attack' },
    ],
    ballPosition: { x: 0.02, y: 0.02 },
  },
  {
    id: 'corner-short',
    name: 'Short Corner',
    category: 'corner',
    description: 'Short corner routine with 2v1 wide overload',
    homePositions: [
      // Goalkeeper
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // Counter defense at halfway
      { x: 0.4, y: 0.50, positionCode: 'CB', role: 'Counter cover' },
      { x: 0.6, y: 0.50, positionCode: 'CB', role: 'Counter cover' },
      // Corner taker
      { x: 0.02, y: 0.02, positionCode: 'RW', role: 'Corner taker' },
      // Short option - creates 2v1
      { x: 0.10, y: 0.06, positionCode: 'LM', role: 'Short option' },
      // Box runners waiting for delivery
      { x: 0.40, y: 0.06, positionCode: 'ST', role: 'Near post' },
      { x: 0.50, y: 0.05, positionCode: 'ST', role: 'Penalty spot' },
      { x: 0.60, y: 0.06, positionCode: 'CM', role: 'Far post' },
      { x: 0.55, y: 0.04, positionCode: 'CM', role: '6-yard' },
      // Edge of box
      { x: 0.45, y: 0.14, positionCode: 'CDM', role: 'Edge' },
      { x: 0.55, y: 0.16, positionCode: 'CM', role: 'Edge' },
    ],
    awayPositions: [
      // Goalkeeper
      { x: 0.52, y: 0.03, positionCode: 'GK', role: 'Goalkeeper' },
      // Posts
      { x: 0.38, y: 0.02, positionCode: 'CB', role: 'Near post' },
      { x: 0.62, y: 0.02, positionCode: 'CB', role: 'Far post' },
      // Box coverage
      { x: 0.45, y: 0.05, positionCode: 'CB', role: 'Zonal' },
      { x: 0.52, y: 0.05, positionCode: 'CDM', role: 'Zonal' },
      { x: 0.58, y: 0.05, positionCode: 'CM', role: 'Zonal' },
      // Press short corner
      { x: 0.15, y: 0.08, positionCode: 'LM', role: 'Press short' },
      { x: 0.38, y: 0.12, positionCode: 'RM', role: 'Edge' },
      { x: 0.60, y: 0.14, positionCode: 'CM', role: 'Edge' },
      // Counter
      { x: 0.50, y: 0.50, positionCode: 'ST', role: 'Counter-attack' },
      { x: 0.55, y: 0.52, positionCode: 'RW', role: 'Counter-attack' },
    ],
    ballPosition: { x: 0.02, y: 0.02 },
  },
]

// Free kick templates - Realistic formations with proper wall
export const freeKickTemplates: SetPieceTemplate[] = [
  {
    id: 'freekick-direct-central',
    name: 'Direct Free Kick (Central)',
    category: 'freeKick',
    description: 'Direct shot from central position - 4-man wall',
    homePositions: [
      // Goalkeeper
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // Defensive cover
      { x: 0.25, y: 0.75, positionCode: 'CB', role: 'Cover' },
      { x: 0.75, y: 0.75, positionCode: 'CB', role: 'Cover' },
      { x: 0.15, y: 0.65, positionCode: 'LB', role: 'Wide cover' },
      { x: 0.85, y: 0.65, positionCode: 'RB', role: 'Wide cover' },
      // Shooter(s) at ball - ~22 yards out
      { x: 0.48, y: 0.20, positionCode: 'CM', role: 'Shooter' },
      { x: 0.52, y: 0.20, positionCode: 'ST', role: 'Decoy/Second shooter' },
      // Runners in box
      { x: 0.35, y: 0.06, positionCode: 'LW', role: 'Near post run' },
      { x: 0.50, y: 0.06, positionCode: 'ST', role: 'Penalty spot' },
      { x: 0.65, y: 0.06, positionCode: 'RW', role: 'Far post run' },
      // Edge of box for rebounds
      { x: 0.50, y: 0.14, positionCode: 'CM', role: 'Rebound' },
    ],
    awayPositions: [
      // Goalkeeper - covering far side from wall
      { x: 0.55, y: 0.02, positionCode: 'GK', role: 'Goalkeeper' },
      // 4-man wall - tight together at 10 yards (y ~0.12)
      { x: 0.40, y: 0.12, positionCode: 'CB', role: 'Wall anchor' },
      { x: 0.44, y: 0.12, positionCode: 'CB', role: 'Wall' },
      { x: 0.48, y: 0.12, positionCode: 'CDM', role: 'Wall' },
      { x: 0.52, y: 0.12, positionCode: 'CM', role: 'Wall end' },
      // Charger - ready to close down
      { x: 0.58, y: 0.14, positionCode: 'CM', role: 'Charger' },
      // Man markers in box
      { x: 0.36, y: 0.06, positionCode: 'LB', role: 'Man marker' },
      { x: 0.50, y: 0.05, positionCode: 'CB', role: 'Central marker' },
      { x: 0.64, y: 0.06, positionCode: 'RB', role: 'Man marker' },
      // Counter-attack players
      { x: 0.35, y: 0.40, positionCode: 'LW', role: 'Counter' },
      { x: 0.65, y: 0.40, positionCode: 'ST', role: 'Counter' },
    ],
    ballPosition: { x: 0.50, y: 0.22 },
  },
  {
    id: 'freekick-cross-wide',
    name: 'Crossing Free Kick (Wide)',
    category: 'freeKick',
    description: 'Crossing free kick from wide - 2-man wall',
    homePositions: [
      // Goalkeeper
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // Defensive cover at halfway
      { x: 0.4, y: 0.55, positionCode: 'CB', role: 'Counter cover' },
      { x: 0.6, y: 0.55, positionCode: 'CB', role: 'Counter cover' },
      { x: 0.85, y: 0.50, positionCode: 'RB', role: 'Wide cover' },
      // Taker at ball
      { x: 0.12, y: 0.18, positionCode: 'LW', role: 'Taker' },
      // Box attackers
      { x: 0.35, y: 0.05, positionCode: 'ST', role: 'Near post' },
      { x: 0.45, y: 0.04, positionCode: 'CM', role: '6-yard' },
      { x: 0.50, y: 0.06, positionCode: 'ST', role: 'Penalty spot' },
      { x: 0.58, y: 0.04, positionCode: 'CM', role: '6-yard' },
      { x: 0.68, y: 0.06, positionCode: 'RW', role: 'Far post' },
      // Edge of box
      { x: 0.50, y: 0.16, positionCode: 'CDM', role: 'Edge - second balls' },
    ],
    awayPositions: [
      // Goalkeeper
      { x: 0.52, y: 0.03, positionCode: 'GK', role: 'Goalkeeper' },
      // 2-man wall for wide kick
      { x: 0.22, y: 0.12, positionCode: 'LB', role: 'Wall' },
      { x: 0.26, y: 0.12, positionCode: 'LM', role: 'Wall' },
      // Post players
      { x: 0.38, y: 0.02, positionCode: 'CB', role: 'Near post' },
      { x: 0.62, y: 0.02, positionCode: 'CB', role: 'Far post' },
      // Zonal markers
      { x: 0.44, y: 0.05, positionCode: 'CB', role: 'Zonal' },
      { x: 0.50, y: 0.05, positionCode: 'CDM', role: 'Zonal' },
      { x: 0.56, y: 0.05, positionCode: 'CM', role: 'Zonal' },
      { x: 0.64, y: 0.06, positionCode: 'CM', role: 'Far marker' },
      // Edge
      { x: 0.55, y: 0.14, positionCode: 'RM', role: 'Edge' },
      // Counter
      { x: 0.50, y: 0.50, positionCode: 'ST', role: 'Counter-attack' },
    ],
    ballPosition: { x: 0.12, y: 0.18 },
  },
  {
    id: 'freekick-quick-pass',
    name: 'Quick Free Kick',
    category: 'freeKick',
    description: 'Quick free kick to exploit disorganized defense',
    homePositions: [
      // Goalkeeper
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // Back line
      { x: 0.2, y: 0.80, positionCode: 'LB', role: 'Cover' },
      { x: 0.35, y: 0.85, positionCode: 'CB', role: 'Cover' },
      { x: 0.65, y: 0.85, positionCode: 'CB', role: 'Cover' },
      { x: 0.8, y: 0.80, positionCode: 'RB', role: 'Cover' },
      // Taker - ready for quick ball
      { x: 0.35, y: 0.30, positionCode: 'CM', role: 'Quick taker' },
      // Runners exploiting space
      { x: 0.50, y: 0.22, positionCode: 'CM', role: 'Quick option' },
      { x: 0.65, y: 0.18, positionCode: 'RW', role: 'Runner' },
      { x: 0.50, y: 0.12, positionCode: 'ST', role: 'Target' },
      { x: 0.35, y: 0.14, positionCode: 'LW', role: 'Runner' },
      { x: 0.55, y: 0.40, positionCode: 'CDM', role: 'Support' },
    ],
    awayPositions: [
      // Goalkeeper
      { x: 0.50, y: 0.02, positionCode: 'GK', role: 'Goalkeeper' },
      // Disorganized defense (catching up)
      { x: 0.42, y: 0.08, positionCode: 'CB', role: 'Recovering' },
      { x: 0.52, y: 0.08, positionCode: 'CB', role: 'Recovering' },
      { x: 0.62, y: 0.10, positionCode: 'CB', role: 'Recovering' },
      { x: 0.30, y: 0.15, positionCode: 'LB', role: 'Catching up' },
      { x: 0.70, y: 0.14, positionCode: 'RB', role: 'Catching up' },
      // Players around foul location
      { x: 0.40, y: 0.28, positionCode: 'CDM', role: 'Near ball' },
      { x: 0.48, y: 0.32, positionCode: 'CM', role: 'Near ball' },
      // Forward players
      { x: 0.35, y: 0.55, positionCode: 'LW', role: 'Forward' },
      { x: 0.55, y: 0.50, positionCode: 'ST', role: 'Forward' },
      { x: 0.70, y: 0.55, positionCode: 'RW', role: 'Forward' },
    ],
    ballPosition: { x: 0.35, y: 0.30 },
  },
]

// Penalty templates - Full 11v11 on penalty arc
export const penaltyTemplates: SetPieceTemplate[] = [
  {
    id: 'penalty-standard',
    name: 'Standard Penalty',
    category: 'penalty',
    description: 'Standard penalty - all players on arc edge',
    homePositions: [
      // Goalkeeper stays back
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // Penalty taker
      { x: 0.5, y: 0.095, positionCode: 'ST', role: 'Penalty taker' },
      // Players on penalty arc edge (D) - must be 10 yards from ball
      { x: 0.28, y: 0.18, positionCode: 'LW', role: 'Arc - rebound' },
      { x: 0.36, y: 0.16, positionCode: 'LM', role: 'Arc - rebound left' },
      { x: 0.44, y: 0.15, positionCode: 'CM', role: 'Arc - rebound' },
      { x: 0.56, y: 0.15, positionCode: 'CM', role: 'Arc - rebound' },
      { x: 0.64, y: 0.16, positionCode: 'RM', role: 'Arc - rebound right' },
      { x: 0.72, y: 0.18, positionCode: 'RW', role: 'Arc - rebound' },
      // Defensive cover - back four stay behind
      { x: 0.20, y: 0.55, positionCode: 'LB', role: 'Counter cover' },
      { x: 0.40, y: 0.55, positionCode: 'CB', role: 'Counter cover' },
      { x: 0.60, y: 0.55, positionCode: 'CB', role: 'Counter cover' },
    ],
    awayPositions: [
      // Goalkeeper on line
      { x: 0.5, y: 0.02, positionCode: 'GK', role: 'Goalkeeper' },
      // Players on penalty arc edge - ready for rebound
      { x: 0.26, y: 0.18, positionCode: 'LB', role: 'Arc - clear' },
      { x: 0.34, y: 0.16, positionCode: 'CB', role: 'Arc - clear' },
      { x: 0.42, y: 0.15, positionCode: 'CDM', role: 'Arc - clear' },
      { x: 0.50, y: 0.15, positionCode: 'CM', role: 'Arc - clear' },
      { x: 0.58, y: 0.15, positionCode: 'CM', role: 'Arc - clear' },
      { x: 0.66, y: 0.16, positionCode: 'CB', role: 'Arc - clear' },
      { x: 0.74, y: 0.18, positionCode: 'RB', role: 'Arc - clear' },
      // Counter threat
      { x: 0.35, y: 0.45, positionCode: 'LW', role: 'Counter' },
      { x: 0.50, y: 0.40, positionCode: 'ST', role: 'Counter' },
      { x: 0.65, y: 0.45, positionCode: 'RW', role: 'Counter' },
    ],
    ballPosition: { x: 0.5, y: 0.095 },
  },
]

// Goal kick templates - Full 11 players with realistic build-up
export const goalKickTemplates: SetPieceTemplate[] = [
  {
    id: 'goalkick-short-buildup',
    name: 'Short Goal Kick Build-up',
    category: 'goalKick',
    description: 'Short passing build-up from back - 4-3-3 shape',
    homePositions: [
      // Goalkeeper with ball
      { x: 0.5, y: 0.93, positionCode: 'GK', role: 'Goalkeeper' },
      // CBs split wide
      { x: 0.28, y: 0.85, positionCode: 'CB', role: 'Left CB - wide' },
      { x: 0.72, y: 0.85, positionCode: 'CB', role: 'Right CB - wide' },
      // Full backs high and wide
      { x: 0.10, y: 0.70, positionCode: 'LB', role: 'Left back - high' },
      { x: 0.90, y: 0.70, positionCode: 'RB', role: 'Right back - high' },
      // CDM drops as pivot
      { x: 0.5, y: 0.75, positionCode: 'CDM', role: 'Pivot - outlet' },
      // CMs in half spaces
      { x: 0.35, y: 0.60, positionCode: 'CM', role: 'Left CM' },
      { x: 0.65, y: 0.60, positionCode: 'CM', role: 'Right CM' },
      // Front 3 stretch opposition
      { x: 0.15, y: 0.45, positionCode: 'LW', role: 'Left wing - stretch' },
      { x: 0.50, y: 0.40, positionCode: 'ST', role: 'Striker - target' },
      { x: 0.85, y: 0.45, positionCode: 'RW', role: 'Right wing - stretch' },
    ],
    awayPositions: [
      // GK in goal
      { x: 0.50, y: 0.02, positionCode: 'GK', role: 'Goalkeeper' },
      // High press - 4-3-3
      { x: 0.50, y: 0.55, positionCode: 'ST', role: 'Press GK' },
      { x: 0.30, y: 0.58, positionCode: 'LW', role: 'Press RCB' },
      { x: 0.70, y: 0.58, positionCode: 'RW', role: 'Press LCB' },
      // Midfield line
      { x: 0.35, y: 0.45, positionCode: 'CM', role: 'Cover CM' },
      { x: 0.50, y: 0.42, positionCode: 'CDM', role: 'Cover pivot' },
      { x: 0.65, y: 0.45, positionCode: 'CM', role: 'Cover CM' },
      // Defensive line
      { x: 0.15, y: 0.30, positionCode: 'LB', role: 'Left back' },
      { x: 0.38, y: 0.28, positionCode: 'CB', role: 'Left CB' },
      { x: 0.62, y: 0.28, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.30, positionCode: 'RB', role: 'Right back' },
    ],
    ballPosition: { x: 0.5, y: 0.93 },
  },
  {
    id: 'goalkick-long',
    name: 'Long Goal Kick',
    category: 'goalKick',
    description: 'Long ball to target striker with support runners',
    homePositions: [
      // Goalkeeper with ball
      { x: 0.5, y: 0.93, positionCode: 'GK', role: 'Goalkeeper' },
      // Back four stay deep
      { x: 0.15, y: 0.82, positionCode: 'LB', role: 'Left back' },
      { x: 0.35, y: 0.85, positionCode: 'CB', role: 'Left CB' },
      { x: 0.65, y: 0.85, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.82, positionCode: 'RB', role: 'Right back' },
      // Midfield ready for second balls
      { x: 0.35, y: 0.55, positionCode: 'CM', role: 'Second ball left' },
      { x: 0.50, y: 0.58, positionCode: 'CDM', role: 'Second ball central' },
      { x: 0.65, y: 0.55, positionCode: 'CM', role: 'Second ball right' },
      // Target man and supporting runners
      { x: 0.50, y: 0.38, positionCode: 'ST', role: 'Target man' },
      { x: 0.35, y: 0.42, positionCode: 'LW', role: 'Support run' },
      { x: 0.65, y: 0.42, positionCode: 'RW', role: 'Support run' },
    ],
    awayPositions: [
      // GK
      { x: 0.50, y: 0.02, positionCode: 'GK', role: 'Goalkeeper' },
      // Back line - ready to compete for header
      { x: 0.15, y: 0.25, positionCode: 'LB', role: 'Left back' },
      { x: 0.40, y: 0.28, positionCode: 'CB', role: 'Mark striker' },
      { x: 0.60, y: 0.28, positionCode: 'CB', role: 'Cover' },
      { x: 0.85, y: 0.25, positionCode: 'RB', role: 'Right back' },
      // Midfield win second balls
      { x: 0.30, y: 0.40, positionCode: 'CM', role: 'Second ball' },
      { x: 0.50, y: 0.38, positionCode: 'CDM', role: 'Second ball' },
      { x: 0.70, y: 0.40, positionCode: 'CM', role: 'Second ball' },
      // Attackers stay high for counter
      { x: 0.30, y: 0.60, positionCode: 'LW', role: 'Counter' },
      { x: 0.50, y: 0.55, positionCode: 'ST', role: 'Counter target' },
      { x: 0.70, y: 0.60, positionCode: 'RW', role: 'Counter' },
    ],
    ballPosition: { x: 0.5, y: 0.93 },
  },
]

// Throw-in templates - Realistic with defensive shape maintained
export const throwInTemplates: SetPieceTemplate[] = [
  {
    id: 'throwin-attacking',
    name: 'Attacking Throw-In',
    category: 'throwIn',
    description: 'Throw-in in attacking third with box runners',
    homePositions: [
      // Goalkeeper stays back
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // Defensive cover maintained
      { x: 0.35, y: 0.60, positionCode: 'CB', role: 'Cover' },
      { x: 0.55, y: 0.60, positionCode: 'CB', role: 'Cover' },
      { x: 0.75, y: 0.55, positionCode: 'RB', role: 'Cover' },
      { x: 0.45, y: 0.45, positionCode: 'CDM', role: 'Defensive midfielder' },
      // Thrower on touchline
      { x: 0.02, y: 0.20, positionCode: 'LB', role: 'Thrower' },
      // Short option nearby
      { x: 0.12, y: 0.15, positionCode: 'LW', role: 'Short option' },
      // Support and runners
      { x: 0.25, y: 0.25, positionCode: 'CM', role: 'Support - back to goal' },
      // Box runners
      { x: 0.40, y: 0.08, positionCode: 'ST', role: 'Near post run' },
      { x: 0.55, y: 0.08, positionCode: 'ST', role: 'Far post run' },
      { x: 0.35, y: 0.16, positionCode: 'CM', role: 'Edge of box' },
    ],
    awayPositions: [
      // Goalkeeper
      { x: 0.50, y: 0.02, positionCode: 'GK', role: 'Goalkeeper' },
      // Near and far post
      { x: 0.38, y: 0.03, positionCode: 'CB', role: 'Near post' },
      { x: 0.62, y: 0.03, positionCode: 'CB', role: 'Far post' },
      // Box markers
      { x: 0.42, y: 0.06, positionCode: 'CB', role: 'Mark striker' },
      { x: 0.54, y: 0.06, positionCode: 'CDM', role: 'Mark striker' },
      // Press throw area
      { x: 0.15, y: 0.18, positionCode: 'LM', role: 'Press throw' },
      { x: 0.28, y: 0.22, positionCode: 'CM', role: 'Cover short' },
      // Edge coverage
      { x: 0.40, y: 0.14, positionCode: 'CM', role: 'Edge' },
      { x: 0.60, y: 0.14, positionCode: 'RM', role: 'Edge' },
      // Counter-attack
      { x: 0.50, y: 0.45, positionCode: 'ST', role: 'Counter' },
      { x: 0.70, y: 0.40, positionCode: 'RW', role: 'Counter' },
    ],
    ballPosition: { x: 0.02, y: 0.20 },
  },
  {
    id: 'throwin-midfield',
    name: 'Midfield Throw-In',
    category: 'throwIn',
    description: 'Throw-in in midfield - maintain possession',
    homePositions: [
      // Goalkeeper
      { x: 0.5, y: 0.98, positionCode: 'GK', role: 'Goalkeeper' },
      // Back four
      { x: 0.15, y: 0.85, positionCode: 'LB', role: 'Left back' },
      { x: 0.35, y: 0.88, positionCode: 'CB', role: 'Left CB' },
      { x: 0.65, y: 0.88, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.85, positionCode: 'RB', role: 'Right back' },
      // Thrower
      { x: 0.02, y: 0.50, positionCode: 'LM', role: 'Thrower' },
      // Options for throw
      { x: 0.15, y: 0.45, positionCode: 'LW', role: 'Short - feet' },
      { x: 0.25, y: 0.55, positionCode: 'CM', role: 'Back to goal' },
      { x: 0.35, y: 0.40, positionCode: 'ST', role: 'Flick on target' },
      // Supporting midfield
      { x: 0.50, y: 0.55, positionCode: 'CDM', role: 'Support' },
      { x: 0.65, y: 0.45, positionCode: 'CM', role: 'Switch option' },
    ],
    awayPositions: [
      // Goalkeeper
      { x: 0.50, y: 0.02, positionCode: 'GK', role: 'Goalkeeper' },
      // Back four
      { x: 0.15, y: 0.20, positionCode: 'LB', role: 'Left back' },
      { x: 0.35, y: 0.18, positionCode: 'CB', role: 'Left CB' },
      { x: 0.65, y: 0.18, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.20, positionCode: 'RB', role: 'Right back' },
      // Press throw
      { x: 0.12, y: 0.48, positionCode: 'LM', role: 'Press thrower' },
      { x: 0.20, y: 0.42, positionCode: 'LW', role: 'Mark short' },
      // Midfield cover
      { x: 0.35, y: 0.38, positionCode: 'CM', role: 'Cover' },
      { x: 0.50, y: 0.35, positionCode: 'CDM', role: 'Screen' },
      { x: 0.65, y: 0.38, positionCode: 'CM', role: 'Cover' },
      // Striker
      { x: 0.50, y: 0.55, positionCode: 'ST', role: 'Counter' },
    ],
    ballPosition: { x: 0.02, y: 0.50 },
  },
]

// Kickoff templates - Realistic 11v11 formations
export const kickoffTemplates: SetPieceTemplate[] = [
  {
    id: 'kickoff-standard',
    name: 'Standard Kickoff (4-3-3)',
    category: 'kickoff',
    description: 'Standard 4-3-3 kickoff formation',
    homePositions: [
      { x: 0.5, y: 0.95, positionCode: 'GK', role: 'Goalkeeper' },
      { x: 0.15, y: 0.80, positionCode: 'LB', role: 'Left back' },
      { x: 0.38, y: 0.85, positionCode: 'CB', role: 'Left CB' },
      { x: 0.62, y: 0.85, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.80, positionCode: 'RB', role: 'Right back' },
      { x: 0.30, y: 0.65, positionCode: 'CM', role: 'Left CM' },
      { x: 0.50, y: 0.70, positionCode: 'CDM', role: 'CDM' },
      { x: 0.70, y: 0.65, positionCode: 'CM', role: 'Right CM' },
      { x: 0.20, y: 0.52, positionCode: 'LW', role: 'Left wing' },
      { x: 0.50, y: 0.51, positionCode: 'ST', role: 'Striker - kickoff' },
      { x: 0.80, y: 0.52, positionCode: 'RW', role: 'Right wing' },
    ],
    awayPositions: [
      { x: 0.50, y: 0.05, positionCode: 'GK', role: 'Goalkeeper' },
      { x: 0.15, y: 0.20, positionCode: 'LB', role: 'Left back' },
      { x: 0.38, y: 0.15, positionCode: 'CB', role: 'Left CB' },
      { x: 0.62, y: 0.15, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.20, positionCode: 'RB', role: 'Right back' },
      { x: 0.30, y: 0.35, positionCode: 'CM', role: 'Left CM' },
      { x: 0.50, y: 0.30, positionCode: 'CDM', role: 'CDM' },
      { x: 0.70, y: 0.35, positionCode: 'CM', role: 'Right CM' },
      { x: 0.20, y: 0.48, positionCode: 'LW', role: 'Left wing' },
      { x: 0.50, y: 0.52, positionCode: 'ST', role: 'Striker' },
      { x: 0.80, y: 0.48, positionCode: 'RW', role: 'Right wing' },
    ],
    ballPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 'kickoff-back',
    name: 'Kickoff Back to Keeper',
    category: 'kickoff',
    description: 'Kickoff played back for possession build-up',
    homePositions: [
      { x: 0.5, y: 0.95, positionCode: 'GK', role: 'Goalkeeper' },
      { x: 0.15, y: 0.78, positionCode: 'LB', role: 'Left back' },
      { x: 0.38, y: 0.82, positionCode: 'CB', role: 'Left CB' },
      { x: 0.62, y: 0.82, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.78, positionCode: 'RB', role: 'Right back' },
      { x: 0.35, y: 0.65, positionCode: 'CM', role: 'Left CM' },
      { x: 0.50, y: 0.60, positionCode: 'CDM', role: 'CDM - receive' },
      { x: 0.65, y: 0.65, positionCode: 'CM', role: 'Right CM' },
      { x: 0.25, y: 0.52, positionCode: 'LW', role: 'Left wing' },
      { x: 0.48, y: 0.51, positionCode: 'ST', role: 'Striker - kickoff' },
      { x: 0.52, y: 0.51, positionCode: 'CM', role: 'Partner - tap back' },
    ],
    awayPositions: [
      { x: 0.50, y: 0.05, positionCode: 'GK', role: 'Goalkeeper' },
      { x: 0.15, y: 0.20, positionCode: 'LB', role: 'Left back' },
      { x: 0.38, y: 0.15, positionCode: 'CB', role: 'Left CB' },
      { x: 0.62, y: 0.15, positionCode: 'CB', role: 'Right CB' },
      { x: 0.85, y: 0.20, positionCode: 'RB', role: 'Right back' },
      { x: 0.30, y: 0.35, positionCode: 'CM', role: 'Left CM' },
      { x: 0.50, y: 0.30, positionCode: 'CDM', role: 'CDM' },
      { x: 0.70, y: 0.35, positionCode: 'CM', role: 'Right CM' },
      { x: 0.20, y: 0.48, positionCode: 'LW', role: 'Left wing - press' },
      { x: 0.50, y: 0.52, positionCode: 'ST', role: 'Striker - press' },
      { x: 0.80, y: 0.48, positionCode: 'RW', role: 'Right wing - press' },
    ],
    ballPosition: { x: 0.5, y: 0.5 },
  },
]

// All templates combined
export const allSetPieceTemplates: SetPieceTemplate[] = [
  ...cornerTemplates,
  ...freeKickTemplates,
  ...penaltyTemplates,
  ...goalKickTemplates,
  ...throwInTemplates,
  ...kickoffTemplates,
]

// Get templates by category
export function getTemplatesByCategory(category: SetPieceTemplate['category']): SetPieceTemplate[] {
  return allSetPieceTemplates.filter((t) => t.category === category)
}

// Get template by ID
export function getTemplateById(id: string): SetPieceTemplate | undefined {
  return allSetPieceTemplates.find((t) => t.id === id)
}

// Category labels
export const categoryLabels: Record<SetPieceTemplate['category'], string> = {
  corner: 'Corner Kicks',
  freeKick: 'Free Kicks',
  penalty: 'Penalties',
  throwIn: 'Throw-Ins',
  goalKick: 'Goal Kicks',
  kickoff: 'Kickoffs',
}
