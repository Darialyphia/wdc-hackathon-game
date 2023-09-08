import type { GameState } from '..';
import {
  ENTITY_MOVED,
  entityMovedEvent,
  type EntityMovedEvent
} from './entityMoved.event';
import type { SoldierSummonedEvent } from './soldierSummoned.event';

export type GameEvent = EntityMovedEvent | SoldierSummonedEvent;

export const reducer = (state: GameState, event: GameEvent) => {
  switch (event.type) {
    case ENTITY_MOVED:
      entityMovedEvent.execute(state, event.payload);
  }
};
