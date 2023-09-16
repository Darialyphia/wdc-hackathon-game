import type { SkillExecutionContext, SkillId } from '../../resources/entity';
import type { Entity } from '../entity';
import { dealDamageEvent } from '../events/dealDamage.event';
import { entityDiedEvent } from '../events/entityDied.event';
import { getEntityAt } from './entity.helpers';

export const getSkillById = (entity: Entity, skillId: SkillId) => {
  return entity.blueprint.skills.find(skill => skill.id === skillId);
};

export const dealSingleTargetDamage = (
  { state, caster, target, reducer }: SkillExecutionContext,
  { basePower }: { basePower: number }
) => {
  const entity = getEntityAt(state, target);
  if (!entity) return;

  reducer(
    state,
    dealDamageEvent.create(
      state.activeEntityId,
      entity.id,
      Math.max(1, basePower + caster.blueprint.attack - entity.blueprint.defense)
    )
  );

  if (entity.hp <= 0) {
    reducer(state, entityDiedEvent.create(caster.id, entity.id));
  }
};
