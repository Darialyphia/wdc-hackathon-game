import { necroGeneral01 } from './necropolis';
import { havenGeneral01 } from './haven';
import type { EntityData } from '../utils/entityData';
import type { CharacterId } from '../entity';
import type { SoldierData } from '../soldiers';

export type GeneralData = EntityData & { summonBlueprints: SoldierData[] };

export const generalsLookup = { havenGeneral01, necroGeneral01 } satisfies Record<
  CharacterId,
  GeneralData
>;

Object.entries(generalsLookup).forEach(([k, v]) => {
  if (k !== v.characterId) {
    console.warn(
      `[General Lookup]: key and characterId mismatch: ${k}, ${v.characterId}`
    );
  }
});
