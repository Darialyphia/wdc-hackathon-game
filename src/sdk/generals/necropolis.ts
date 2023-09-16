import type { GeneralData } from '.';
import { dealDamageEvent } from '../events/dealDamage.event';
import { entityDiedEvent } from '../events/entityDied.event';
import { getEntityAt } from '../utils/entity.helpers';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';

export const necroGeneral: GeneralData = {
  characterId: 'necro_general_01',
  spriteId: 'necroGeneral01',
  iconUrl: '/icons/necro_general_01.gif',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Necromancer',
  initiative: 6,
  maxHp: 20,
  attack: 3,
  defense: 1,
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      cost: 2,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      execute(ctx) {
        dealSingleTargetDamage(ctx, { basePower: 1 });
      }
    }
  ]
};