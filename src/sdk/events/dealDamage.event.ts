import { AnimatedSprite } from 'pixi.js';
import { defineEvent } from '.';
import { CELL_SIZE } from '../constants';
import type { EntityId } from '../entity';
import { createSpritesheetFrameObject } from '../../utils/sprite-utils';
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
  sequence: (state, { payload }, { assets, fxContainer, sprites }) =>
    new Promise(resolve => {
      const targetSprite = sprites.resolve(payload.targetId);

      const sheet = assets.resolveFx('blood01');
      const blood = new AnimatedSprite(createSpritesheetFrameObject('idle', sheet));
      blood.position.set(0, 0);
      blood.loop = false;

      blood.onComplete = () => {
        blood.destroy();
      };
      blood.anchor.set(0.5);

      targetSprite?.addChild(blood);
      blood.play();
      resolve();
    })
});
