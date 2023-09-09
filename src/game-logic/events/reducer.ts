import type { GameState } from '..';
import { DEAL_DAMAGE, dealDamageEvent, type DealDamageEvent } from './dealDamage.event';
import { END_TURN, endTurnEvent, type EndTurnEvent } from './endTurn.event';
import {
  ENTITY_MOVED,
  entityMovedEvent,
  type EntityMovedEvent
} from './entityMoved.event';
import { SKILL_USED, skillUsedEvent, type SkillUsedEvent } from './skillUsed.event';
import {
  SOLDIER_SUMMONED,
  soldierSummonedEvent,
  type SoldierSummonedEvent
} from './soldierSummoned.event';
import { exhaustiveSwitch } from '@/utils/assertions';

export type GameEvent =
  | EntityMovedEvent
  | SoldierSummonedEvent
  | EndTurnEvent
  | DealDamageEvent
  | SkillUsedEvent;

export const reducer = (state: GameState, event: GameEvent) => {
  const { type, payload } = event;

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
    case SKILL_USED:
      skillUsedEvent.execute(state, payload);
      break;
    default:
      exhaustiveSwitch(type);
  }

  state.history.push(event);
};
