import { defineEvent } from '.';
import type { EntityId } from '../entity';
import { getEntityById } from '../utils/entity.helpers';

export const HEAL = 'heal';

export type HealEvent = {
  type: typeof HEAL;
  payload: {
    sourceId: EntityId;
    targetId: EntityId;
    amount: number;
  };
};

export const healEvent = defineEvent({
  create: (sourceId: EntityId, targetId: EntityId, amount: number): HealEvent => ({
    type: HEAL,
    payload: { sourceId, targetId, amount }
  }),
  execute: (state, { targetId, amount }) => {
    const entity = getEntityById(state, targetId);
    if (!entity) return state;

    entity.hp = Math.min(entity.blueprint.maxHp, entity.hp + amount);

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
        hp: Math.min(entity.blueprint.maxHp, entity.hp + payload.amount)
      });
    })
});
