import type { Point } from '../../utils/geometry';
import type { EntityId } from '../entity';
import { defineEvent } from '.';
import { getEntityById } from '../utils/entity.helpers';

export const ENTITY_MOVED = 'entity_moved';

export type EntityMovedEvent = {
  type: typeof ENTITY_MOVED;
  payload: {
    sourceId: EntityId;
    to: Point[];
  };
};

export const entityMovedEvent = defineEvent({
  create: (sourceId: EntityId, to: Point[]): EntityMovedEvent => ({
    type: ENTITY_MOVED,
    payload: { to, sourceId }
  }),
  execute: (state, event) => {
    const entity = getEntityById(state, event.sourceId);
    if (!entity) return state;

    entity.position = event.to.at(-1)!;
    entity.ap -= event.to.length;

    return state;
  },
  sequence: (state, event) => {
    return new Promise(resolve => {
      const entity = getEntityById(state, event.payload.sourceId)!;

      const tl = gsap.timeline();
      event.payload.to.forEach((point, index) => {
        const isLast = point === event.payload.to.at(-1);

        tl.to(entity.position, {
          duration: 0.3,
          ease: isLast ? Power1.easeOut : Power0.easeNone,
          onComplete: isLast ? resolve : undefined,
          delay: 0,
          x: point.x,
          y: point.y
        });
      });
    });
  }
});
