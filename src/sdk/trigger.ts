import type { GameState } from '.';
import type { Values } from '../utils/types';
import type { Entity } from './entity';
import { type GameEvent, createReducer, type GameReducer } from './events/reducer';

export const TRIGGERS = {
  NEW_TURN: 'new_turn'
} as const;

export type TriggerId = Values<typeof TRIGGERS>;

export type TriggerContext = {
  state: GameState;
  from: Entity;
  reducer: GameReducer;
};

export type Trigger = {
  on: TriggerId;
  execute: (ctx: TriggerContext) => void;
};

export const executeTrigger = (state: GameState, id: TriggerId) => {
  state.entities.forEach(entity => {
    if (entity.state === 'DEAD') return;

    entity.triggers.forEach(trigger => {
      if (trigger.on === id) {
        trigger.execute({
          reducer: createReducer({ persist: false }),
          state,
          from: entity
        });
      }
    });
  });
};
