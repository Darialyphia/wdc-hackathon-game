import type { GameState } from '..';
import { END_TURN, endTurnEvent, type EndTurnEvent } from './endturn.event';
import {
  ENTITY_MOVED,
  entityMovedEvent,
  type EntityMovedEvent
} from './entityMoved.event';
import {
  SOLDIER_SUMMONED,
  soldierSummonedEvent,
  type SoldierSummonedEvent
} from './soldierSummoned.event';

export type GameEvent = EntityMovedEvent | SoldierSummonedEvent | EndTurnEvent;

export const reducer = (state: GameState, { type, payload }: GameEvent) => {
  switch (type) {
    case ENTITY_MOVED:
      entityMovedEvent.execute(state, payload);
      break;
    case SOLDIER_SUMMONED:
      soldierSummonedEvent.execute(state, payload);
      break;
    case END_TURN:
      endTurnEvent.execute(state, payload);
      break;
    default:
      exhaustiveSwitch(type);
  }
};
