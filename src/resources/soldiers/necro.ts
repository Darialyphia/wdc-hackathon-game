import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';

export const skeleton: SoldierData = {
  id: 'skeleton',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Skeleton',
  cost: 2,
  initiative: 5
};

export const necroSoldiers = { skeleton };
