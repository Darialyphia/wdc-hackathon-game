import type { Point } from '../../utils/geometry';
import type { EntityId } from '../entity';
import { defineEvent } from '.';
import { getEntityById } from '../utils/entity.helpers';
import { applyAuras } from '../aura';

export const ENTITY_MOVED = 'entity_moved';

export type EntityMovedEvent = {
  type: typeof ENTITY_MOVED;
  payload: {
    sourceId: EntityId;
    to: Point[];
  };
};

const waitFor = (duration: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), duration);
  });

export const entityMovedEvent = defineEvent({
  create: (sourceId: EntityId, to: Point[]): EntityMovedEvent => ({
    type: ENTITY_MOVED,
    payload: { to, sourceId }
  }),
  execute: (state, event) => {
    const entity = getEntityById(state, event.sourceId);
    if (!entity) return state;

    entity.position = event.to.at(-1)!;
    entity.movedAmount += event.to.length;

    applyAuras(state);

    return state;
  },
  sequence: async (state, event) => {
    const entity = getEntityById(state, event.payload.sourceId)!;

    for (const point of event.payload.to) {
      entity.position.x = point.x;
      entity.position.y = point.y;
      await waitFor(300);
    }
  }
});
