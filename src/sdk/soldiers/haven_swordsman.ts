import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { dealSingleTargetDamage } from '../utils/skill.helpers';

export const havenSwordsman: SoldierData = {
  characterId: 'havenSwordsman',
  iconUrl: '/icons/haven_swordsman.gif',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Swordsman',
  cost: 2,
  initiative: 7,
  maxHp: 6,
  maxAp: 3,
  attack: 2,
  defense: 1,
  triggers: [],
  auras: [],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description: 'Deals damage to a close enemy',
      cost: 1,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      execute({ state, caster, target }) {
        dealSingleTargetDamage(state, state.reducer, {
          from: caster.id,
          to: getEntityAt(state, target)!.id,
          basePower: 1
        });
      }
    }
  ]
};
