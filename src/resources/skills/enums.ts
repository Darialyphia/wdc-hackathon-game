import type { Values } from '../../utils/types';

export const TARGET_TYPES = {
  LINE: 'LINE',
  // SQUARE: 'SQUARE',
  // SELF: 'SELF',
  ALLY: 'ALLY',
  ENEMY: 'ENEMY',
  ANYTHING: 'ANYTHING'
  // RADIUS: 'RADIUS'
} as const;

export type TargetType = Values<typeof TARGET_TYPES>;
