import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';

export const havenGeneral: GeneralData = {
  characterId: 'haven_hero',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Daria',
  initiative: 6,
  skills: [
    {
      id: 'haven_hero_default_attack',
      name: 'Normal attack',
      cost: 1
    }
  ]
};
