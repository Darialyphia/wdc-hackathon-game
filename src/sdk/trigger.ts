import type { GameState } from '.';
import type { Values } from '../utils/types';
import type { Entity } from './entity';
import { reducer, type GameEvent } from './events/reducer';

export const TRIGGERS = {
  NEW_TURN: 'new_turn'
} as const;

export type TriggerId = Values<typeof TRIGGERS>;

export type TriggerContext = {
  reducer: (state: GameState, event: GameEvent) => void;
  state: GameState;
  from: Entity;
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
          reducer,
          state,
          from: entity
        });
      }
    });
  });
};
