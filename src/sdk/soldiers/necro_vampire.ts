import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { dealSingleTargetDamage } from '../utils/skill.helpers';

export const necroVampire: SoldierData = {
  characterId: 'necroVampire',
  iconUrl: '/icons/necro_vampire.gif',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Vampire',
  cost: 3,
  initiative: 8,
  maxHp: 9,
  maxAp: 4,
  attack: 2,
  defense: 0,
  triggers: [],
  auras: [],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description:
        'Deals damage to a close enemy and heals for the amount of damage dealt',
      cost: 1,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      execute({ state, caster, target }) {
        dealSingleTargetDamage(state, state.reducer, {
          from: caster.id,
          to: getEntityAt(state, target)!.id,
          basePower: 1,
          lifeDrainRatio: 1
        });
      }
    }
  ]
};
