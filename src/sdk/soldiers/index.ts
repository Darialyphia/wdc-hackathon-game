import type { CharacterId } from '../entity';
import { FACTIONS_IDS, type FactionId } from '../enums';
import { havenSoldiers } from './haven';
import { necroSoldiers } from './necro';
import type { EntityData } from '../utils/entityData';

export type SoldierData = EntityData & {
  cost: number;
};

export const soldiersByFaction = {
  [FACTIONS_IDS.HAVEN]: Object.fromEntries(havenSoldiers.map(e => [e.characterId, e])),
  [FACTIONS_IDS.NECRO]: Object.fromEntries(necroSoldiers.map(e => [e.characterId, e]))
} satisfies Record<FactionId, Record<CharacterId, SoldierData>>;

export const soldiers = Object.fromEntries(
  [...Object.values(havenSoldiers), ...Object.values(necroSoldiers)].map(g => [
    g.characterId,
    g
  ])
) satisfies Record<CharacterId, SoldierData>;

export const getSoldierById = (characterId: CharacterId) =>
  Object.values(soldiers).find(s => s.characterId === characterId);
