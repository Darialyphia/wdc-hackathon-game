import type { GeneralData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';

export const havenGeneral: GeneralData = {
  characterId: 'haven_general_01',
  spriteId: 'havenGeneral01',
  iconUrl: '/icons/haven_general_01.gif',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Paladin',
  initiative: 10,
  maxHp: 20,
  attack: 3,
  defense: 1,
  triggers: [],
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
        dealSingleTargetDamage(ctx, {
          to: getEntityAt(ctx.state, ctx.target)!.id,
          basePower: 1
        });
      }
    }
  ]
};
