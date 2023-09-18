import type { Values } from '../utils/types';

export const MAP_WIDTH = 17;
export const MAP_HEIGHT = 11;
export const MAX_ATB = 100;

export const CELL_SIZE = 48;

export const GAME_LIFECYCLE_STATES = {
  STARTED: 'STARTED',
  FINISHED: 'FINISHED'
} as const;

export type GameLifecycleState = Values<typeof GAME_LIFECYCLE_STATES>;
