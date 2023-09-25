import type { Values } from '../utils/types';

export const MAX_ATB = 100;

export const CELL_SIZE = 64;

export const GAME_LIFECYCLE_STATES = {
  STARTED: 'STARTED',
  FINISHED: 'FINISHED'
} as const;

export type GameLifecycleState = Values<typeof GAME_LIFECYCLE_STATES>;
