export default {
  GAME: {
    WIDTH: 800,
    HEIGHT: 600,
    FPS: 60
  },
  PLAYER: {
    SPEED: 5,
    FIRE_RATE: 250,
    LIVES: 3,
    INVINCIBILITY_MS: 2000
  },
  INVADER: {
    ROWS: 5,
    COLS: 11,
    SPEED: 1,
    DROP_DISTANCE: 30,
    FIRE_CHANCE: 0.01,
    TYPES: ["basic", "tough", "elite"]
  },
  BULLET: {
    SPEED: 8,
    ENEMY_SPEED: 4
  },
  BARRIER: {
    COUNT: 4,
    BLOCKS_WIDE: 8,
    BLOCKS_HIGH: 5,
    BLOCK_SIZE: 8
  },
  POWERUPS: {
    CHANCE: 0.1,
    TYPES: ["speed", "multishot", "shield"],
    DURATION: 5000
  },
  SCORING: {
    BASIC: 10,
    TOUGH: 20,
    ELITE: 40,
    COMBO_MULTIPLIER: 0.5,
    COMBO_WINDOW: 1000
  }
};