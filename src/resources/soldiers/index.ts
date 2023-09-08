import type { CharacterId } from '@/game-logic/entity';
import { FACTIONS_IDS, type FactionId } from '../enums';
import { havenSoldiers } from './haven';
import { necroSoldiers } from './necro';

export type SoldierData = {
  id: CharacterId;
  factionId: FactionId;
  name: string;
  cost: number;
  initiative: number;
  skills: SkillData[];
};

export type SkillId = string;
export type SkillData = {
  id: SkillId;
  name: string;
  cost: number;
};

export const soldiersByFaction = {
  [FACTIONS_IDS.HAVEN]: havenSoldiers,
  [FACTIONS_IDS.NECRO]: necroSoldiers
};

export const soldiers = Object.fromEntries(
  [...Object.values(havenSoldiers), ...Object.values(necroSoldiers)].map(g => [g.id, g])
) satisfies Record<CharacterId, SoldierData>;
