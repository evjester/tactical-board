// Animation presets for common tactical patterns

export interface AnimationPreset {
  id: string
  name: string
  description: string
  category: 'attack' | 'defense' | 'transition' | 'setpiece'
  // Keyframes with relative positions (0-1 scale)
  keyframes: Array<{
    durationMs: number
    homePositions: Array<{
      playerIndex: number
      x: number
      y: number
    }>
    awayPositions?: Array<{
      playerIndex: number
      x: number
      y: number
    }>
    ballPosition?: { x: number; y: number }
  }>
}

export const ANIMATION_PRESETS: AnimationPreset[] = [
  // Attack patterns
  {
    id: 'overlap-run',
    name: 'Overlapping Run',
    description: 'Full-back overlaps the winger to create width',
    category: 'attack',
    keyframes: [
      {
        durationMs: 500,
        homePositions: [
          { playerIndex: 1, x: 0.2, y: 0.6 }, // RB starting
          { playerIndex: 6, x: 0.35, y: 0.55 }, // RM with ball
        ],
        ballPosition: { x: 0.35, y: 0.55 },
      },
      {
        durationMs: 800,
        homePositions: [
          { playerIndex: 1, x: 0.25, y: 0.45 }, // RB moving up
          { playerIndex: 6, x: 0.4, y: 0.5 }, // RM holds
        ],
        ballPosition: { x: 0.4, y: 0.5 },
      },
      {
        durationMs: 800,
        homePositions: [
          { playerIndex: 1, x: 0.35, y: 0.3 }, // RB overlaps
          { playerIndex: 6, x: 0.45, y: 0.45 }, // RM cuts inside
        ],
        ballPosition: { x: 0.35, y: 0.3 },
      },
    ],
  },
  {
    id: 'through-ball',
    name: 'Through Ball Run',
    description: 'Striker makes run behind defense for through ball',
    category: 'attack',
    keyframes: [
      {
        durationMs: 500,
        homePositions: [
          { playerIndex: 8, x: 0.5, y: 0.5 }, // CAM with ball
          { playerIndex: 9, x: 0.5, y: 0.35 }, // ST waiting
        ],
        ballPosition: { x: 0.5, y: 0.5 },
      },
      {
        durationMs: 600,
        homePositions: [
          { playerIndex: 8, x: 0.5, y: 0.48 }, // CAM preparing
          { playerIndex: 9, x: 0.5, y: 0.28 }, // ST starts run
        ],
        ballPosition: { x: 0.5, y: 0.48 },
      },
      {
        durationMs: 800,
        homePositions: [
          { playerIndex: 8, x: 0.5, y: 0.45 }, // CAM plays ball
          { playerIndex: 9, x: 0.5, y: 0.15 }, // ST through on goal
        ],
        ballPosition: { x: 0.5, y: 0.18 },
      },
    ],
  },
  {
    id: 'one-two',
    name: 'One-Two Pass',
    description: 'Quick wall pass to beat a defender',
    category: 'attack',
    keyframes: [
      {
        durationMs: 400,
        homePositions: [
          { playerIndex: 6, x: 0.4, y: 0.55 }, // Player with ball
          { playerIndex: 8, x: 0.5, y: 0.45 }, // Support player
        ],
        ballPosition: { x: 0.4, y: 0.55 },
      },
      {
        durationMs: 400,
        homePositions: [
          { playerIndex: 6, x: 0.42, y: 0.5 }, // First pass
          { playerIndex: 8, x: 0.5, y: 0.45 }, // Receives
        ],
        ballPosition: { x: 0.5, y: 0.45 },
      },
      {
        durationMs: 400,
        homePositions: [
          { playerIndex: 6, x: 0.48, y: 0.4 }, // Continues run
          { playerIndex: 8, x: 0.48, y: 0.43 }, // Return pass
        ],
        ballPosition: { x: 0.48, y: 0.4 },
      },
    ],
  },
  {
    id: 'switch-play',
    name: 'Switch Play',
    description: 'Long diagonal ball to switch the point of attack',
    category: 'attack',
    keyframes: [
      {
        durationMs: 500,
        homePositions: [
          { playerIndex: 3, x: 0.2, y: 0.5 }, // LB with ball
          { playerIndex: 6, x: 0.8, y: 0.45 }, // RW waiting
        ],
        ballPosition: { x: 0.2, y: 0.5 },
      },
      {
        durationMs: 1000,
        homePositions: [
          { playerIndex: 3, x: 0.2, y: 0.5 }, // LB plays long
          { playerIndex: 6, x: 0.82, y: 0.4 }, // RW moves to receive
        ],
        ballPosition: { x: 0.8, y: 0.42 },
      },
    ],
  },

  // Defensive patterns
  {
    id: 'pressing-trap',
    name: 'Pressing Trap',
    description: 'Coordinated press to win ball high up the pitch',
    category: 'defense',
    keyframes: [
      {
        durationMs: 500,
        homePositions: [
          { playerIndex: 9, x: 0.5, y: 0.35 }, // ST pressing
          { playerIndex: 7, x: 0.4, y: 0.4 }, // LW closing
          { playerIndex: 6, x: 0.6, y: 0.4 }, // RW closing
        ],
        awayPositions: [
          { playerIndex: 4, x: 0.5, y: 0.3 }, // Defender with ball
        ],
        ballPosition: { x: 0.5, y: 0.3 },
      },
      {
        durationMs: 600,
        homePositions: [
          { playerIndex: 9, x: 0.5, y: 0.3 }, // ST engages
          { playerIndex: 7, x: 0.38, y: 0.32 }, // LW blocks pass
          { playerIndex: 6, x: 0.62, y: 0.32 }, // RW blocks pass
        ],
        awayPositions: [
          { playerIndex: 4, x: 0.5, y: 0.3 }, // Defender trapped
        ],
        ballPosition: { x: 0.5, y: 0.3 },
      },
    ],
  },
  {
    id: 'defensive-drop',
    name: 'Defensive Drop',
    description: 'Midfield drops to form compact defensive block',
    category: 'defense',
    keyframes: [
      {
        durationMs: 600,
        homePositions: [
          { playerIndex: 5, x: 0.4, y: 0.55 }, // CM high
          { playerIndex: 6, x: 0.6, y: 0.55 }, // CM high
          { playerIndex: 4, x: 0.5, y: 0.65 }, // CDM
        ],
      },
      {
        durationMs: 800,
        homePositions: [
          { playerIndex: 5, x: 0.4, y: 0.7 }, // CM drops
          { playerIndex: 6, x: 0.6, y: 0.7 }, // CM drops
          { playerIndex: 4, x: 0.5, y: 0.75 }, // CDM drops
        ],
      },
    ],
  },
  {
    id: 'offside-trap',
    name: 'Offside Trap',
    description: 'Defensive line steps up to catch attackers offside',
    category: 'defense',
    keyframes: [
      {
        durationMs: 400,
        homePositions: [
          { playerIndex: 2, x: 0.3, y: 0.75 }, // CB
          { playerIndex: 3, x: 0.5, y: 0.75 }, // CB
          { playerIndex: 4, x: 0.7, y: 0.75 }, // CB
        ],
      },
      {
        durationMs: 400,
        homePositions: [
          { playerIndex: 2, x: 0.3, y: 0.65 }, // CB steps
          { playerIndex: 3, x: 0.5, y: 0.65 }, // CB steps
          { playerIndex: 4, x: 0.7, y: 0.65 }, // CB steps
        ],
      },
    ],
  },

  // Transition patterns
  {
    id: 'counter-attack',
    name: 'Counter Attack',
    description: 'Fast break with players sprinting into space',
    category: 'transition',
    keyframes: [
      {
        durationMs: 400,
        homePositions: [
          { playerIndex: 4, x: 0.5, y: 0.75 }, // CDM wins ball
          { playerIndex: 9, x: 0.5, y: 0.5 }, // ST ready
          { playerIndex: 7, x: 0.3, y: 0.55 }, // LW ready
        ],
        ballPosition: { x: 0.5, y: 0.75 },
      },
      {
        durationMs: 600,
        homePositions: [
          { playerIndex: 4, x: 0.5, y: 0.7 }, // CDM plays forward
          { playerIndex: 9, x: 0.5, y: 0.35 }, // ST sprints
          { playerIndex: 7, x: 0.25, y: 0.4 }, // LW sprints
        ],
        ballPosition: { x: 0.5, y: 0.4 },
      },
      {
        durationMs: 800,
        homePositions: [
          { playerIndex: 4, x: 0.5, y: 0.6 }, // CDM supports
          { playerIndex: 9, x: 0.5, y: 0.2 }, // ST in box
          { playerIndex: 7, x: 0.2, y: 0.25 }, // LW in position
        ],
        ballPosition: { x: 0.5, y: 0.22 },
      },
    ],
  },
  {
    id: 'recovery-run',
    name: 'Recovery Run',
    description: 'Defenders tracking back after losing possession',
    category: 'transition',
    keyframes: [
      {
        durationMs: 500,
        homePositions: [
          { playerIndex: 2, x: 0.35, y: 0.5 }, // CB out of position
          { playerIndex: 3, x: 0.65, y: 0.5 }, // CB out of position
        ],
        awayPositions: [
          { playerIndex: 9, x: 0.5, y: 0.55 }, // Attacker with ball
        ],
        ballPosition: { x: 0.5, y: 0.55 },
      },
      {
        durationMs: 800,
        homePositions: [
          { playerIndex: 2, x: 0.4, y: 0.7 }, // CB recovering
          { playerIndex: 3, x: 0.6, y: 0.7 }, // CB recovering
        ],
        awayPositions: [
          { playerIndex: 9, x: 0.5, y: 0.7 }, // Attacker advancing
        ],
        ballPosition: { x: 0.5, y: 0.7 },
      },
    ],
  },

  // Set piece patterns
  {
    id: 'corner-near-post',
    name: 'Near Post Corner',
    description: 'Attacking near post flick-on from corner',
    category: 'setpiece',
    keyframes: [
      {
        durationMs: 600,
        homePositions: [
          { playerIndex: 7, x: 0.05, y: 0.05 }, // Taker
          { playerIndex: 9, x: 0.3, y: 0.15 }, // Near post runner
          { playerIndex: 8, x: 0.5, y: 0.2 }, // Far post runner
        ],
        ballPosition: { x: 0.05, y: 0.05 },
      },
      {
        durationMs: 800,
        homePositions: [
          { playerIndex: 7, x: 0.1, y: 0.1 }, // Taker delivers
          { playerIndex: 9, x: 0.2, y: 0.1 }, // Near post attack
          { playerIndex: 8, x: 0.4, y: 0.12 }, // Far post attack
        ],
        ballPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },
  {
    id: 'free-kick-wall',
    name: 'Free Kick Routine',
    description: 'Decoy run with late runner behind wall',
    category: 'setpiece',
    keyframes: [
      {
        durationMs: 500,
        homePositions: [
          { playerIndex: 8, x: 0.45, y: 0.35 }, // Taker 1
          { playerIndex: 7, x: 0.55, y: 0.35 }, // Taker 2 (decoy)
          { playerIndex: 9, x: 0.6, y: 0.25 }, // Late runner
        ],
        ballPosition: { x: 0.5, y: 0.35 },
      },
      {
        durationMs: 600,
        homePositions: [
          { playerIndex: 8, x: 0.45, y: 0.33 }, // Taker prepares
          { playerIndex: 7, x: 0.55, y: 0.3 }, // Decoy runs over
          { playerIndex: 9, x: 0.55, y: 0.2 }, // Late runner starts
        ],
        ballPosition: { x: 0.5, y: 0.35 },
      },
      {
        durationMs: 600,
        homePositions: [
          { playerIndex: 8, x: 0.45, y: 0.3 }, // Taker shoots
          { playerIndex: 7, x: 0.6, y: 0.25 }, // Decoy clear
          { playerIndex: 9, x: 0.5, y: 0.12 }, // Late runner at target
        ],
        ballPosition: { x: 0.5, y: 0.15 },
      },
    ],
  },
]

export function getPresetsByCategory(category: AnimationPreset['category']): AnimationPreset[] {
  return ANIMATION_PRESETS.filter((preset) => preset.category === category)
}

export function getPresetById(id: string): AnimationPreset | undefined {
  return ANIMATION_PRESETS.find((preset) => preset.id === id)
}
