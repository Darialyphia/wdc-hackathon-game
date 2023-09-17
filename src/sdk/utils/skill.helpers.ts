import type { SkillExecutionContext, SkillId } from './entityData';
import type { Entity, EntityId } from '../entity';
import { dealDamageEvent } from '../events/dealDamage.event';
import { entityDiedEvent } from '../events/entityDied.event';
import { getEntityAt, getEntityById } from './entity.helpers';
import { healEvent } from '../events/healEvent';
import type { GameState } from '..';
import type { GameReducer } from '../events/reducer';

export const getSkillById = (entity: Entity, skillId: SkillId) => {
  return entity.blueprint.skills.find(skill => skill.id === skillId);
};

export const dealSingleTargetDamage = (
  state: GameState,
  reducer: GameReducer,
  {
    basePower,
    lifeDrainRatio,
    from,
    to
  }: { basePower: number; lifeDrainRatio?: number; to: EntityId; from: EntityId }
) => {
  const target = getEntityById(state, to);
  const caster = getEntityById(state, from);

  if (!target || !caster) return;

  const amount = Math.max(1, basePower + caster.attack - target.defense);
  reducer(state, dealDamageEvent.create(state.activeEntityId, target.id, amount));

  if (lifeDrainRatio) {
    healSingleTarget(state, reducer, {
      baseAmount: Math.round(amount * lifeDrainRatio),
      from: caster.id,
      to: caster.id
    });
  }

  if (target.hp <= 0) {
    reducer(state, entityDiedEvent.create(caster.id, target.id));
  }
};

export const healSingleTarget = (
  state: GameState,
  reducer: GameReducer,

  { from, to, baseAmount }: { baseAmount: number; from: EntityId; to: EntityId }
) => {
  const entity = getEntityById(state, to);
  if (!entity) return;

  reducer(state, healEvent.create(state.activeEntityId, entity.id, baseAmount));

  if (entity.hp <= 0) {
    reducer(state, entityDiedEvent.create(from, entity.id));
  }
};
