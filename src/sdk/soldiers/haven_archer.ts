import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';
import { AREA_TYPE, TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { dealSingleTargetDamage } from '../utils/skill.helpers';

export const havenArcher: SoldierData = {
  characterId: 'havenArcher',
  iconUrl: '/icons/haven_archer.gif',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Swordsman',
  cost: 2,
  initiative: 6,
  maxHp: 5,
  maxAp: 4,
  attack: 2,
  defense: 0,
  speed: 3,
  apRegenRate: 1,
  triggers: [],
  auras: [],
  skills: [
    {
      id: 'ranged_attack',
      iconUrl: '/icons/ranged_attack.png',
      name: 'Ranged attack',
      description: 'Deals damage to an enemy at range',
      cost: 0,
      range: 4,
      minRange: 2,
      targetZone: TARGET_ZONES.LINE,
      targetType: TARGET_TYPES.ENEMY,
      areaType: AREA_TYPE.RADIUS,
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
