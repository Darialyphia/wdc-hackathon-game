import type { SkillData, SkillId } from './entityData';
import type { Entity, EntityId } from '../entity';
import { dealDamageEvent } from '../events/dealDamage.event';
import { entityDiedEvent } from '../events/entityDied.event';
import { getEntityAt, getEntityById } from './entity.helpers';
import { healEvent } from '../events/healEvent';
import type { GameState } from '..';
import type { GameReducer } from '../events/reducer';
import type { Point } from '../../utils/geometry';
import { exhaustiveSwitch } from '../../utils/assertions';

export const getSkillById = (entity: Entity, skillId: SkillId) => {
  return entity.blueprint.skills.find(skill => skill.id === skillId);
};

export const isTargetTypeValid = (
  point: Point,
  { state, skill, caster }: { state: GameState; skill: SkillData; caster: Entity }
) => {
  const { targetType } = skill;
  const entity = getEntityAt(state, point);

  switch (targetType) {
    case 'ALLY':
      return entity && entity?.owner === caster.owner;
    case 'ENEMY':
      return !!(entity && entity?.owner !== caster.owner);
    case 'SELF':
      return entity?.id === state.activeEntityId;
    case 'EMPTY':
      return entity === undefined;
    case 'ANYWHERE':
      return true;
    default:
      exhaustiveSwitch(targetType);
  }
};

export const dealSingleTargetDamage = (
  state: GameState,
  reducer: GameReducer,
  {
    basePower,
    lifeDrainRatio,
    from,
    to,
    isFlat
  }: {
    basePower: number;
    lifeDrainRatio?: number;
    to: EntityId;
    from: EntityId;
    isFlat?: boolean;
  }
) => {
  const target = getEntityById(state, to);
  const caster = getEntityById(state, from);

  if (!target || !caster) return;

  const amount = isFlat
    ? basePower
    : Math.max(1, basePower + caster.attack - target.defense);
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
