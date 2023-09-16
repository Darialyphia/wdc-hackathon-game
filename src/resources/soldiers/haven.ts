import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import { meleeAttack } from '../skills/meleeAttack';
import { rangedAttack } from '../skills/rangedAttack';

export const havenSoldiers: SoldierData[] = [
  {
    characterId: 'swordsman',
    spriteId: 'havenSwordsman',
    iconUrl: '/icons/haven_swordsman.gif',
    factionId: FACTIONS_IDS.HAVEN,
    name: 'Swordsman',
    cost: 2,
    initiative: 5,
    maxHp: 6,
    attack: 2,
    defense: 1,
    skills: [meleeAttack.id]
  },
  {
    characterId: 'archer',
    spriteId: 'havenArcher',
    iconUrl: '/icons/haven_archer.gif',
    factionId: FACTIONS_IDS.HAVEN,
    name: 'Swordsman',
    cost: 2,
    initiative: 5,
    maxHp: 4,
    attack: 1,
    defense: 1,
    skills: [rangedAttack.id]
  }
];
