import { defineEvent } from '.';
import { GAME_LIFECYCLE_STATES } from '..';
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
    entity.position = { x: -1, y: -1 };

    if (isGeneral(entity)) {
      state.lifecycleState = GAME_LIFECYCLE_STATES.FINISHED;
      state.winner =
        state.players[0] === entity.owner ? state.players[1] : state.players[0];
    }

    return state;
  }
});
