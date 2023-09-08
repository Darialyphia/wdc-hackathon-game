import type { GameState } from '..';
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

export type GameEvent = EntityMovedEvent | SoldierSummonedEvent;

export const reducer = (state: GameState, { type, payload }: GameEvent) => {
  switch (type) {
    case ENTITY_MOVED:
      entityMovedEvent.execute(state, payload);
      break;
    case SOLDIER_SUMMONED:
      soldierSummonedEvent.execute(state, payload);
      break;
    default:
      exhaustiveSwitch(type);
  }
};
