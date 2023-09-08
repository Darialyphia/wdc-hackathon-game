import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';

export const necroGeneral: GeneralData = {
  characterId: 'necro_hero',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Borax',
  initiative: 6,
  maxHp: 30,
  attack: 4,
  defense: 2,
  skills: [
    {
      id: 'necro_hero_default_attack',
      name: 'Normal attack',
      cost: 1
    }
  ]
};
