import { necroGeneral } from './necropolis';
import { havenGeneral } from './haven';
import type { EntityData } from '../entity';

export type GeneralData = EntityData;

export const generals = Object.fromEntries(
  [necroGeneral, havenGeneral].map(g => [g.characterId, g])
) satisfies Record<string, GeneralData>;
