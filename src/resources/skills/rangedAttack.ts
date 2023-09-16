import type { SkillData } from '.';
import { TARGET_TYPES, TARGET_ZONES } from './enums';
import { getEntityAt } from '../../game-logic/utils/entity.helpers';
import { dealDamageEvent } from '../../game-logic/events/dealDamage.event';
import { entityDiedEvent } from '../../game-logic/events/entityDied.event';

export const rangedAttack: SkillData = {
  id: 'ranged_attack',
  iconUrl: '/icons/ranged_attack.png',
  name: 'Ranged attack',
  cost: 2,
  range: 5,
  minRange: 2,
  targetZone: TARGET_ZONES.LINE,
  targetType: TARGET_TYPES.ENEMY,
  execute(reducer, state, caster, target) {
    const entity = getEntityAt(state, target);
    if (!entity) return [];
    reducer(
      state,
      dealDamageEvent.create(
        state.activeEntityId,
        entity.id,
        Math.max(1, 1 + caster.blueprint.attack - entity.blueprint.defense)
      )
    );
    if (entity.hp <= 0) {
      reducer(state, entityDiedEvent.create(caster.id, entity.id));
    }
  }
};
