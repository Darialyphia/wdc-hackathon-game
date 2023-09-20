import type { CharacterId } from '../entity';
import type { EntityData } from '../utils/entityData';

import { havenSwordsman } from './havenSwordsman';
import { havenArcher } from './havenArcher';
import { necroSkeleton } from './necro_skeleton';
import { necroVampire } from './necro_vampire';

export type SoldierData = EntityData & {
  cost: number;
};

export const soldiers = {
  havenSwordsman,
  havenArcher,
  necroSkeleton,
  necroVampire
} satisfies Record<CharacterId, SoldierData>;
