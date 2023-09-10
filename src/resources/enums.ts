import type { Values } from '../utils/types';

export const FACTIONS_IDS = {
  HAVEN: 'faction_haven',
  NECRO: 'faction_necro'
} as const;

export type FactionId = Values<typeof FACTIONS_IDS>;
