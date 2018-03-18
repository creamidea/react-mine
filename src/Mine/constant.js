const FIELD_FLAG = {
  M: 'M', // Unrevealed Mine
  E: 'E', // Unrevealed Empty Square
  B: 'B', // Revealed Blank Square
  X: 'X', // Revealed Mine
};

const GAME_STATUS = {
  READY: 'ready',
  RUNNING: 'running',
  PAUSE: 'pause',
  OVER: 'game over',
};

const GAME_LEVEL = {
  EASY: 'easy',
  MIDDLE: 'middle',
  HARD: 'hard',
};

const GAME_RESULT = {
  SUCCESS: '0',
  FAILURE: '1',
};

export {
  FIELD_FLAG,
  GAME_STATUS,
  GAME_LEVEL,
  GAME_RESULT,
};
