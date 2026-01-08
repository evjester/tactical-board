// Position definitions for soccer players
export interface PositionDefinition {
  code: string
  name: string
  abbreviation: string
  zone: 'goalkeeper' | 'defense' | 'midfield' | 'attack'
  horizontalZone: 'left' | 'leftCenter' | 'center' | 'rightCenter' | 'right'
}

export const POSITIONS: Record<string, PositionDefinition> = {
  // Goalkeeper
  GK: {
    code: 'GK',
    name: 'Goalkeeper',
    abbreviation: 'GK',
    zone: 'goalkeeper',
    horizontalZone: 'center',
  },

  // Defenders
  LB: {
    code: 'LB',
    name: 'Left Back',
    abbreviation: 'LB',
    zone: 'defense',
    horizontalZone: 'left',
  },
  LCB: {
    code: 'LCB',
    name: 'Left Center Back',
    abbreviation: 'CB',
    zone: 'defense',
    horizontalZone: 'leftCenter',
  },
  CB: {
    code: 'CB',
    name: 'Center Back',
    abbreviation: 'CB',
    zone: 'defense',
    horizontalZone: 'center',
  },
  RCB: {
    code: 'RCB',
    name: 'Right Center Back',
    abbreviation: 'CB',
    zone: 'defense',
    horizontalZone: 'rightCenter',
  },
  RB: {
    code: 'RB',
    name: 'Right Back',
    abbreviation: 'RB',
    zone: 'defense',
    horizontalZone: 'right',
  },
  LWB: {
    code: 'LWB',
    name: 'Left Wing Back',
    abbreviation: 'LWB',
    zone: 'defense',
    horizontalZone: 'left',
  },
  RWB: {
    code: 'RWB',
    name: 'Right Wing Back',
    abbreviation: 'RWB',
    zone: 'defense',
    horizontalZone: 'right',
  },

  // Midfielders
  CDM: {
    code: 'CDM',
    name: 'Central Defensive Midfielder',
    abbreviation: 'CDM',
    zone: 'midfield',
    horizontalZone: 'center',
  },
  LDM: {
    code: 'LDM',
    name: 'Left Defensive Midfielder',
    abbreviation: 'DM',
    zone: 'midfield',
    horizontalZone: 'leftCenter',
  },
  RDM: {
    code: 'RDM',
    name: 'Right Defensive Midfielder',
    abbreviation: 'DM',
    zone: 'midfield',
    horizontalZone: 'rightCenter',
  },
  LM: {
    code: 'LM',
    name: 'Left Midfielder',
    abbreviation: 'LM',
    zone: 'midfield',
    horizontalZone: 'left',
  },
  LCM: {
    code: 'LCM',
    name: 'Left Central Midfielder',
    abbreviation: 'CM',
    zone: 'midfield',
    horizontalZone: 'leftCenter',
  },
  CM: {
    code: 'CM',
    name: 'Central Midfielder',
    abbreviation: 'CM',
    zone: 'midfield',
    horizontalZone: 'center',
  },
  RCM: {
    code: 'RCM',
    name: 'Right Central Midfielder',
    abbreviation: 'CM',
    zone: 'midfield',
    horizontalZone: 'rightCenter',
  },
  RM: {
    code: 'RM',
    name: 'Right Midfielder',
    abbreviation: 'RM',
    zone: 'midfield',
    horizontalZone: 'right',
  },
  CAM: {
    code: 'CAM',
    name: 'Central Attacking Midfielder',
    abbreviation: 'CAM',
    zone: 'midfield',
    horizontalZone: 'center',
  },
  LAM: {
    code: 'LAM',
    name: 'Left Attacking Midfielder',
    abbreviation: 'AM',
    zone: 'midfield',
    horizontalZone: 'leftCenter',
  },
  RAM: {
    code: 'RAM',
    name: 'Right Attacking Midfielder',
    abbreviation: 'AM',
    zone: 'midfield',
    horizontalZone: 'rightCenter',
  },

  // Attackers
  LW: {
    code: 'LW',
    name: 'Left Winger',
    abbreviation: 'LW',
    zone: 'attack',
    horizontalZone: 'left',
  },
  RW: {
    code: 'RW',
    name: 'Right Winger',
    abbreviation: 'RW',
    zone: 'attack',
    horizontalZone: 'right',
  },
  LF: {
    code: 'LF',
    name: 'Left Forward',
    abbreviation: 'LF',
    zone: 'attack',
    horizontalZone: 'leftCenter',
  },
  RF: {
    code: 'RF',
    name: 'Right Forward',
    abbreviation: 'RF',
    zone: 'attack',
    horizontalZone: 'rightCenter',
  },
  CF: {
    code: 'CF',
    name: 'Center Forward',
    abbreviation: 'CF',
    zone: 'attack',
    horizontalZone: 'center',
  },
  ST: {
    code: 'ST',
    name: 'Striker',
    abbreviation: 'ST',
    zone: 'attack',
    horizontalZone: 'center',
  },
  LST: {
    code: 'LST',
    name: 'Left Striker',
    abbreviation: 'ST',
    zone: 'attack',
    horizontalZone: 'leftCenter',
  },
  RST: {
    code: 'RST',
    name: 'Right Striker',
    abbreviation: 'ST',
    zone: 'attack',
    horizontalZone: 'rightCenter',
  },
}

// Get all position codes as array
export const POSITION_CODES = Object.keys(POSITIONS)
