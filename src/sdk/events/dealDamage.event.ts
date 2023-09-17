import { defineEvent } from '.';
import type { EntityId } from '../entity';
import { executeTrigger } from '../trigger';
import { getEntityById } from '../utils/entity.helpers';

export const DEAL_DAMAGE = 'deal_damage';

export type DealDamageEvent = {
  type: typeof DEAL_DAMAGE;
  payload: {
    sourceId: EntityId;
    targetId: EntityId;
    amount: number;
  };
};

export const dealDamageEvent = defineEvent({
  create: (sourceId: EntityId, targetId: EntityId, amount: number): DealDamageEvent => ({
    type: DEAL_DAMAGE,
    payload: { sourceId, targetId, amount }
  }),
  execute: (state, { targetId, amount }) => {
    const entity = getEntityById(state, targetId);
    if (!entity) return state;

    entity.hp = Math.max(0, entity.hp - amount);

    return state;
  },
  sequence: (state, { payload }) =>
    new Promise(resolve => {
      const entity = getEntityById(state, payload.targetId)!;
      const hp = entity.hp;
      gsap.to(entity, {
        duration: 0.3,
        ease: Power2.easeOut,
        onComplete: () => {
          // set back hp to old value because the game reducer will decrease it as well
          entity.hp = hp;
          resolve();
        },
        delay: 0,
        hp: entity.hp - payload.amount
      });
    })
});
