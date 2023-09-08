import type { CharacterId } from '@/game-logic/entity';
import { FACTIONS_IDS, type FactionId } from '../enums';
import { havenSoldiers } from './haven';
import { necroSoldiers } from './necro';

export type SoldierData = {
  id: CharacterId;
  factionId: FactionId;
  name: string;
  cost: number;
};

export const soldiersByFaction = {
  [FACTIONS_IDS.HAVEN]: havenSoldiers,
  [FACTIONS_IDS.NECRO]: necroSoldiers
};

export const soldiers = {
  ...havenSoldiers,
  ...necroSoldiers
};
