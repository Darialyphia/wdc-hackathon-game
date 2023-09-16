import type { SkillExecutionContext, SkillId } from './entityData';
import type { Entity, EntityId } from '../entity';
import { dealDamageEvent } from '../events/dealDamage.event';
import { entityDiedEvent } from '../events/entityDied.event';
import { getEntityAt, getEntityById } from './entity.helpers';
import { healEvent } from '../events/healEvent';

export const getSkillById = (entity: Entity, skillId: SkillId) => {
  return entity.blueprint.skills.find(skill => skill.id === skillId);
};

export const dealSingleTargetDamage = (
  ctx: SkillExecutionContext,
  {
    basePower,
    lifeDrainRatio,
    to
  }: { basePower: number; lifeDrainRatio?: number; to: EntityId }
) => {
  const { state, caster } = ctx;
  const entity = getEntityById(state, to);
  if (!entity) return;

  const amount = Math.max(
    1,
    basePower + caster.blueprint.attack - entity.blueprint.defense
  );
  state.reducer(state, dealDamageEvent.create(state.activeEntityId, entity.id, amount));

  if (lifeDrainRatio) {
    healSingleTarget(ctx, {
      baseAmount: Math.round(amount * lifeDrainRatio),
      to: caster.id
    });
  }

  if (entity.hp <= 0) {
    state.reducer(state, entityDiedEvent.create(caster.id, entity.id));
  }
};

export const healSingleTarget = (
  { state, caster }: SkillExecutionContext,
  { to, baseAmount }: { baseAmount: number; to: EntityId }
) => {
  const entity = getEntityById(state, to);
  if (!entity) return;

  state.reducer(state, healEvent.create(state.activeEntityId, entity.id, baseAmount));

  if (entity.hp <= 0) {
    state.reducer(state, entityDiedEvent.create(caster.id, entity.id));
  }
};
