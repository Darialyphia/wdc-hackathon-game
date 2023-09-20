import type { CharacterId } from '../entity';
import type { EntityData } from '../utils/entityData';

import { havenSwordsman } from './haven_swordsman';
import { havenArcher } from './haven_archer';
import { necroSkeleton } from './necro_skeleton';
import { necroVampire } from './necro_vampire';

export type SoldierData = EntityData & {
  cost: number;
};

export const soldiersLookup = {
  havenSwordsman,
  havenArcher,
  necroSkeleton,
  necroVampire
} satisfies Record<CharacterId, SoldierData>;

Object.entries(soldiersLookup).forEach(([k, v]) => {
  if (k !== v.characterId) {
    console.warn(
      `[Soldiers Lookup]: key and characterId mismatch: ${k}, ${v.characterId}`
    );
  }
});
