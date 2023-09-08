import type { CharacterId } from '@/game-logic/entity';
import { necroGeneral } from './necropolis';
import { havenGeneral } from './haven';
import type { FactionId } from '../enums';

export type GeneralData = {
  characterId: CharacterId;
  factionId: FactionId;
  name: string;
};

export const generals = Object.fromEntries(
  [necroGeneral, havenGeneral].map(g => [g.characterId, g])
) satisfies Record<string, GeneralData>;
