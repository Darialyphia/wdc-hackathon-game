import type { GameState } from '.';
import type { Entity } from './entity';
import { createReducer, type GameEvent, type GameReducer } from './events/reducer';

export type TriggerEvent = GameEvent | { type: 'new_turn'; payload: {} };

export type TriggerContext = {
  state: GameState;
  from: Entity;
  reducer: GameReducer;
};

export type Trigger = {
  on: TriggerEvent['type'];
  name: string;
  description: string;
  execute: (ctx: TriggerContext) => void;
};

export const executeTrigger = (state: GameState, event: TriggerEvent) => {
  state.entities.forEach(entity => {
    if (entity.state === 'DEAD') return;

    entity.triggers.forEach(trigger => {
      if (trigger.on === event.type) {
        trigger.execute({
          reducer: createReducer({ persist: false }),
          state,
          from: entity
        });
      }
    });
  });
};
