import type { GameState } from '..';
import { DEAL_DAMAGE, dealDamageEvent, type DealDamageEvent } from './dealDamage.event';
import { END_TURN, endTurnEvent, type EndTurnEvent } from './endTurn.event';
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

export type GameEvent =
  | EntityMovedEvent
  | SoldierSummonedEvent
  | EndTurnEvent
  | DealDamageEvent;

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
    case DEAL_DAMAGE:
      dealDamageEvent.execute(state, payload);
      break;
    default:
      exhaustiveSwitch(type);
  }
};
