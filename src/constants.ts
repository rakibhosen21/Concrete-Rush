
export const COLORS = {
  BACKGROUND: '#050505',
  PRIMARY: '#F2F200', // Concrete Yellow
  SECONDARY: '#00F0FF', // Blue boost
  MULTIPLIER: '#BC00FF', // Purple multiplier
  DANGER: '#FF003C', // Red Trap
  ROAD: '#111111',
  LINE: '#333333',
  GLASS: 'rgba(255, 255, 255, 0.05)',
};

export const GAME_SPEED = {
  INITIAL: 600,
  MAX: 1500,
  INCREMENT: 50,
};

export const PLAYER_CONFIG = {
  START_X: 400,
  START_Y: 500,
  LANES: [200, 400, 600],
  HEALTH: 3,
};

export enum BAG_TYPE {
  YELLOW = 'YELLOW',
  BLUE = 'BLUE',
  PURPLE = 'PURPLE',
  RED = 'RED',
}

export const BAG_CONFIG = {
  [BAG_TYPE.YELLOW]: { color: COLORS.PRIMARY, score: 10, label: 'Yield' },
  [BAG_TYPE.BLUE]: { color: COLORS.SECONDARY, score: 5, label: 'Boost' },
  [BAG_TYPE.PURPLE]: { color: COLORS.MULTIPLIER, score: 0, label: 'Multi' },
  [BAG_TYPE.RED]: { color: COLORS.DANGER, score: -10, label: 'Trap' },
};
