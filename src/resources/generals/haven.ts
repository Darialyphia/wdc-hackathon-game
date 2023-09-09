import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';
import { skills } from '../skills';

export const havenGeneral: GeneralData = {
  characterId: 'haven_hero',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Paladin',
  initiative: 6,
  maxHp: 12,
  attack: 4,
  defense: 1,
  skills: [skills.meleeAttack.id]
};
