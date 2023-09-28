import type { GameState } from '.';
import { ENTITY_STATES, type Entity } from './entity';
import { createReducer, type GameEvent, type GameReducer } from './events/reducer';

export type TriggerEvent =
  | GameEvent
  | { type: 'new_turn'; payload: Record<string, never> };
export type TriggerId = string;

export type TriggerContext = {
  state: GameState;
  from: Entity;
  reducer: GameReducer;
};

export type Trigger = {
  id: TriggerId;
  on: TriggerEvent['type'];
  name: string;
  description: string;
  duration: number;
  execute: (ctx: TriggerContext) => void;
};

export type SerializedTrigger = {
  id: TriggerId;
  duration: number;
};

export const executeTrigger = (state: GameState, event: TriggerEvent) => {
  state.entities.forEach(entity => {
    if (entity.state !== ENTITY_STATES.ALIVE) return;

    entity.triggers.forEach(trigger => {
      if (trigger.on === event.type) {
        trigger.execute({
          reducer: createReducer(),
          state,
          from: entity
        });
      }
    });
  });
};
