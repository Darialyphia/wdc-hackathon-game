import type { GameState } from '../../game-logic';
import type { Entity, EntityId } from '../../game-logic/entity';
import type { EndTurnEvent } from '../../game-logic/events/endTurn.event';
import type { EntityMovedEvent } from '../../game-logic/events/entityMoved.event';
import { reducer, type GameEvent } from '../../game-logic/events/reducer';

type FXSequenceStep<T extends GameEvent> = {
  event: GameEvent;
  play: (state: GameState, event: T) => Promise<void>;
};

export const useFXSequencer = () => {
  const endTurnSequence = (event: GameEvent): FXSequenceStep<GameEvent> => ({
    event,
    play: () => Promise.resolve()
  });

  const buildSequence = (events: GameEvent[]) => {
    const steps: FXSequenceStep<GameEvent>[] = events.map(({ type, payload }) => {
      switch (type) {
        case 'end_turn':
          return endTurnSequence({ type, payload });

        case 'entity_moved':
          return endTurnSequence({ type, payload });

        case 'entity_died':
          return endTurnSequence({ type, payload });

        case 'deal_damage':
          return endTurnSequence({ type, payload });

        case 'soldier_summoned':
          return endTurnSequence({ type, payload });

        case 'skill_used':
          return endTurnSequence({ type, payload });

        default:
          return exhaustiveSwitch(type);
      }
    });

    return {
      async play(state: Ref<GameState>, onStepComplete: (event: GameEvent) => void) {
        for (const step of steps) {
          await step.play(state.value, step.event);
          onStepComplete(step.event);
        }
      }
    };
  };

  return { buildSequence };
};
