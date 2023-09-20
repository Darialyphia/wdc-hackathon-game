import { necroGeneral } from './necropolis';
import { havenGeneral } from './haven';
import type { EntityData } from '../utils/entityData';
import type { CharacterId } from '../entity';
import type { SoldierData } from '../soldiers';

export type GeneralData = EntityData & { summonBlueprints: SoldierData[] };

export const generals = { havenGeneral, necroGeneral } as const;
export const generalIds = Object.values(generals).map(g => g.characterId);

export const getGeneralById = (characterId: CharacterId) =>
  Object.values(generals).find(s => s.characterId === characterId);
