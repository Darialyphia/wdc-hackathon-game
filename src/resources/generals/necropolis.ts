import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';
import { skills } from '../skills';

export const necroGeneral: GeneralData = {
  characterId: 'necro_hero',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Necromancer',
  initiative: 6,
  maxHp: 30,
  attack: 4,
  defense: 2,
  skills: [skills.meleeAttack.id]
};
