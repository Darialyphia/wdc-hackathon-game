import type { Point } from '../../utils/geometry';
import type { EntityId } from '../entity';
import { defineEvent } from '.';
import { getEntityById } from '../utils/entity.helpers';

export const ENTITY_MOVED = 'entity_moved';

export type EntityMovedEvent = {
  type: typeof ENTITY_MOVED;
  payload: {
    sourceId: EntityId;
    to: Point;
  };
};

export const entityMovedEvent = defineEvent({
  create: (sourceId: EntityId, to: Point): EntityMovedEvent => ({
    type: ENTITY_MOVED,
    payload: { to, sourceId }
  }),
  execute: (state, event) => {
    const entity = getEntityById(state, event.sourceId);
    if (!entity) return state;

    entity.position = event.to;
    entity.ap--;

    return state;
  },
  sequence: (state, event) => {
    return new Promise(resolve => {
      const entity = getEntityById(state, event.payload.sourceId)!;

      gsap.to(entity.position, {
        duration: 0.3,
        ease: Power1.easeOut,
        onComplete: resolve,
        delay: 0,
        x: event.payload.to.x,
        y: event.payload.to.y
      });
    });
  }
});
