import type { GeneralData } from '.';
import { FACTIONS_IDS } from '../enums';

export const havenGeneral: GeneralData = {
  characterId: 'haven_hero',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Daria',
  initiative: 6,
  maxHp: 30,
  attack: 4,
  defense: 2,
  skills: [
    {
      id: 'haven_hero_default_attack',
      name: 'Normal attack',
      cost: 1
    }
  ]
};
