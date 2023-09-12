import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';

export const havenGeneral: GeneralData = {
  characterId: 'haven_general_01',
  spriteId: 'havenGeneral01',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Paladin',
  initiative: 6,
  maxHp: 12,
  attack: 4,
  defense: 1,
  skills: ['melee_attack']
};
