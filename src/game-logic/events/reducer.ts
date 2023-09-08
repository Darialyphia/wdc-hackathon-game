import type { GameState } from '..';
import {
  ENTITY_MOVED,
  entityMovedEvent,
  type EntityMovedEvent
} from './entityMoved.event';

export type GameEvent = EntityMovedEvent;

export const reducer = (state: GameState, event: GameEvent) => {
  switch (event.type) {
    case ENTITY_MOVED:
      entityMovedEvent.execute(state, event.payload);
  }
};
