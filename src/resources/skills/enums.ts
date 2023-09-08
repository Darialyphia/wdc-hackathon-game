import type { Values } from '@/utils/types';

export const TARGET_TYPES = {
  LINE: 'LINE',
  SQUARE: 'MELEE',
  SELF: 'SELF',
  ALLY: 'ALLY',
  ENEMY: 'ENEMY',
  ANYWHERE: 'ANYWHERE',
  RADIUS: 'RADIUS'
};

export type TargetType = Values<typeof TARGET_TYPES>;
