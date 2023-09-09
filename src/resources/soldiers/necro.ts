import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import { skills } from '../skills';

export const necroSoldiers: SoldierData[] = [
  {
    characterId: 'skeleton',
    factionId: FACTIONS_IDS.NECRO,
    name: 'Skeleton',
    cost: 2,
    initiative: 5,
    maxHp: 6,
    attack: 3,
    defense: 1,
    skills: [skills.meleeAttack.id]
  }
];
