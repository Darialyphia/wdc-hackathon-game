import type { CharacterId } from '@/game-logic/entity';
import type { FactionId } from '../factions';
import { necroGeneral } from './necropolis';
import { havenGeneral } from './haven';

export type GeneralData = {
  characterId: CharacterId;
  factionId: FactionId;
  name: string;
};
export const characters = { havenGeneral, necroGeneral } satisfies Record<
  string,
  GeneralData
>;
