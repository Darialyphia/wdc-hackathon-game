import { defineEvent } from '.';
import type { EntityId } from '../entity';

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
    state.entities = state.entities.filter(e => e.id !== targetId);

    return state;
  }
});
