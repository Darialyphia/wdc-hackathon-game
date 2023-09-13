import type { SkillData } from '.';
import { TARGET_TYPES } from './enums';
import { getEntityAt } from '../../game-logic/utils/entity.helpers';
import { dealDamageEvent } from '../../game-logic/events/dealDamage.event';
import { entityDiedEvent } from '../../game-logic/events/entityDied.event';
import { reducer } from '../../game-logic/events/reducer';

export const meleeAttack: SkillData = {
  id: 'melee_attack',
  iconUrl: '/icons/melee_attack.png',
  name: 'Melee attack',
  cost: 2,
  range: 1,
  targetType: TARGET_TYPES.ENEMY,
  execute(state, caster, target) {
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
