import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';
import { skills } from '../skills';

export const havenGeneral: GeneralData = {
  characterId: 'haven_hero',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Daria',
  initiative: 6,
  maxHp: 30,
  attack: 4,
  defense: 2,
  skills: [skills.meleeAttack.id]
};
