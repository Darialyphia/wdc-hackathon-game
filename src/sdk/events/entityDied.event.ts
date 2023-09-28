import { defineEvent } from '.';
import { applyAuras } from '../aura';
import { CELL_SIZE, GAME_LIFECYCLE_STATES } from '../constants';
import { ENTITY_STATES, type EntityId } from '../entity';
import { getEntityById, isGeneral } from '../utils/entity.helpers';

export const ENTITY_DIED = 'entity_died';

export type EntityDiedEvent = {
  type: typeof ENTITY_DIED;
  payload: {
    sourceId: EntityId;
    targetId: EntityId;
  };
};

export const entityDiedEvent = defineEvent({
  create: (sourceId: EntityId, targetId: EntityId): EntityDiedEvent => ({
    type: ENTITY_DIED,
    payload: { sourceId, targetId }
  }),
  execute: (state, { targetId }) => {
    const entity = getEntityById(state, targetId)!;
    entity.state = ENTITY_STATES.DEAD;
    entity.position = { x: Infinity, y: Infinity };

    applyAuras(state);

    if (isGeneral(entity)) {
      state.lifecycleState = GAME_LIFECYCLE_STATES.FINISHED;
      state.winner =
        state.players[0] === entity.owner ? state.players[1] : state.players[0];
    }
    return state;
  },

  sequence: (state, { payload }, { sprites }) => {
    return new Promise(resolve => {
      const targetSprite = sprites.resolve(payload.targetId);
      if (!targetSprite) return;

      gsap.to(targetSprite, {
        duration: 0.5,
        ease: Power3.easeOut,
        onComplete: resolve,
        pixi: {
          y: targetSprite.position.x + CELL_SIZE / 3,
          alpha: 0
        }
      });
    });
  }
});
