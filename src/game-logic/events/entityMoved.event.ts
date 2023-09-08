import type { Point } from '@/utils/geometry';
import type { EntityId } from '../entity';
import { defineEvent } from '.';
import { endTurn, getEntityById } from '../utils/entity.helpers';

export const ENTITY_MOVED = 'entity-moved';

export type EntityMovedEvent = {
  type: typeof ENTITY_MOVED;
  payload: {
    entityId: EntityId;
    to: Point;
  };
};

export const entityMovedEvent = defineEvent({
  create: (entityId: EntityId, to: Point): EntityMovedEvent => ({
    type: ENTITY_MOVED,
    payload: { to, entityId }
  }),
  execute: (state, event) => {
    const entity = getEntityById(state, event.entityId);
    if (!entity) throw new Error(`Could not find entity ${event.entityId} !`);

    entity.position = event.to;
    entity.ap--;

    if (entity.ap === 0) {
      endTurn(state);
    }
    return state;
  }
});
