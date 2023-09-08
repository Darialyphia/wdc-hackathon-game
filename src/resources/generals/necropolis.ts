import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';

export const necroGeneral: GeneralData = {
  characterId: 'necro_hero',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Borax',
  initiative: 6,
  skills: [
    {
      id: 'necro_hero_default_attack',
      name: 'Normal attack',
      cost: 1
    }
  ]
};
