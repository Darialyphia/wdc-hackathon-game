import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';

export const necroGeneral: GeneralData = {
  characterId: 'necro_general_01',
  spriteId: 'necroGeneral01',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Necromancer',
  initiative: 6,
  maxHp: 12,
  attack: 4,
  defense: 1,
  skills: ['melee_attack']
};
