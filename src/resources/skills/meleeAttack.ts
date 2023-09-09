import { dealDamageEvent } from '@/game-logic/events/dealDamage.event';
import type { SkillData } from '.';
import { TARGET_TYPES } from './enums';
import { getEntityAt } from '@/game-logic/utils/entity.helpers';

export const meleeAttack: SkillData = {
  id: 'melee_attack',
  name: 'Melee attack',
  cost: 1,
  range: 1,
  targetType: TARGET_TYPES.ENEMY,
  execute(state, caster, target) {
    const entity = getEntityAt(state, target);
    if (!entity) return [];

    return [
      dealDamageEvent.create(
        state.activeEntityId,
        entity.id,
        Math.max(1, caster.blueprint.attack - entity.blueprint.defense)
      )
    ];
  }
};
