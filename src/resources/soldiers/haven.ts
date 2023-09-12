import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import {} from '../factions';

export const havenSoldiers: SoldierData[] = [
  {
    characterId: 'swordsman',
    spriteId: 'havenSwordsman',
    factionId: FACTIONS_IDS.HAVEN,
    name: 'Swordsman',
    cost: 2,
    initiative: 5,
    maxHp: 6,
    attack: 2,
    defense: 1,
    skills: ['melee_attack']
  }
];
