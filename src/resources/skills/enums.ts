import type { Values } from '../../utils/types';

export const TARGET_TYPES = {
  SELF: 'SELF',
  GROUND: 'GROUND',
  ALLY: 'ALLY',
  ENEMY: 'ENEMY',
  EMPTY: 'EMPTY'
} as const;

export type TargetType = Values<typeof TARGET_TYPES>;

export const TARGET_ZONES = {
  LINE: 'LINE',
  RADIUS: 'RADIUS'
} as const;

export type TargetZone = Values<typeof TARGET_ZONES>;
