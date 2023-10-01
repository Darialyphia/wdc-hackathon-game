import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';
import { AREA_TYPE, TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { dealSingleTargetDamage } from '../utils/skill.helpers';

export const necroSkeleton: SoldierData = {
  characterId: 'necroSkeleton',
  iconUrl: '/icons/necro_skeleton.gif',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Skeleton',
  cost: 1,
  initiative: 6,
  maxHp: 6,
  maxAp: 1,
  attack: 1,
  defense: 0,
  speed: 3,
  apRegenRate: 1,
  maxActions: 1,
  triggers: [],
  auras: [],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description: 'Deals damage to a close enemy',
      cost: 0,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      areaType: AREA_TYPE.SQUARE,
      areaSize: 1,
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
