import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';

export const necroSoldiers: SoldierData[] = [
  {
    characterId: 'skeleton',
    factionId: FACTIONS_IDS.NECRO,
    name: 'Skeleton',
    cost: 2,
    initiative: 5,
    maxHp: 10,
    attack: 3,
    defense: 1,
    skills: [
      {
        id: 'skeleton_default_attack',
        name: 'Normal attack',
        cost: 1
      }
    ]
  }
];
