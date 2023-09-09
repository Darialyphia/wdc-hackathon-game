import { defineEvent } from '.';
import type { EntityId } from '../entity';
import { getEntityById } from '../utils/entity.helpers';

export const DEAL_DAMAGE = 'deal_damage';

export type DealDamageEvent = {
  type: typeof DEAL_DAMAGE;
  payload: {
    targetId: EntityId;
    amount: number;
  };
};

export const dealDamageEvent = defineEvent({
  create: (targetId: EntityId, amount: number): DealDamageEvent => ({
    type: DEAL_DAMAGE,
    payload: { targetId, amount }
  }),
  execute: (state, { targetId, amount }) => {
    const entity = getEntityById(state, targetId);
    if (!entity) return state;

    entity.hp = Math.max(0, entity.hp - amount);

    return state;
  }
});
