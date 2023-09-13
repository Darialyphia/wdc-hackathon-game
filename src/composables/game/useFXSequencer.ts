import { type Ref } from 'vue';
import type { GameState } from '../../game-logic';
import {
  DEAL_DAMAGE,
  type DealDamageEvent
} from '../../game-logic/events/dealDamage.event';
import { END_TURN, type EndTurnEvent } from '../../game-logic/events/endTurn.event';
import {
  ENTITY_DIED,
  type EntityDiedEvent
} from '../../game-logic/events/entityDied.event';
import {
  ENTITY_MOVED,
  type EntityMovedEvent
} from '../../game-logic/events/entityMoved.event';
import { type GameEvent } from '../../game-logic/events/reducer';
import { SKILL_USED, type SkillUsedEvent } from '../../game-logic/events/skillUsed.event';
import {
  SOLDIER_SUMMONED,
  type SoldierSummonedEvent
} from '../../game-logic/events/soldierSummoned.event';
import { getEntityById } from '../../game-logic/utils/entity.helpers';
import gsap from 'gsap';
import type { Spritesheet } from 'pixi.js';
import type { EntityId } from '../../game-logic/entity';

export type FXSequenceStep<T extends GameEvent> = {
  event: T;
  play: (state: GameState, event: T) => Promise<void>;
};

export type FXSequence = {
  play(state: Ref<GameState>, onStepComplete: (event: GameEvent) => void): Promise<void>;
};

export type EntitySequenceProps = {
  textures: Spritesheet['textures'];
  onComplete: () => void;
  loop: boolean;
};

export type FXSequenceContext = {
  getSequencePropsForEntity(id: EntityId): EntitySequenceProps;
  buildSequence(events: GameEvent[]): FXSequence;
};

export const useFXSequencer = () => {
  const endTurnSequence = (event: EndTurnEvent): FXSequenceStep<EndTurnEvent> => ({
    event,
    play: () => Promise.resolve()
  });
  const entityMovedSequence = (
    event: EntityMovedEvent
  ): FXSequenceStep<EntityMovedEvent> => ({
    event,
    play: (state, event) => {
      return new Promise(resolve => {
        const entity = getEntityById(state, event.payload.sourceId)!;
        gsap.to(entity.position, {
          duration: 0.5,
          ease: 'power2.out',
          onComplete: resolve,
          delay: 0,
          x: event.payload.to.x,
          y: event.payload.to.y
        });
      });
    }
  });
  const entityDiedSequence = (
    event: EntityDiedEvent
  ): FXSequenceStep<EntityDiedEvent> => ({
    event,
    play: () => Promise.resolve()
  });
  const dealDamageSequence = (
    event: DealDamageEvent
  ): FXSequenceStep<DealDamageEvent> => ({
    event,
    play: () => Promise.resolve()
  });
  const soldierSummonedSequence = (
    event: SoldierSummonedEvent
  ): FXSequenceStep<SoldierSummonedEvent> => ({
    event,
    play: () => Promise.resolve()
  });
  const skillUsedSequence = (event: SkillUsedEvent): FXSequenceStep<SkillUsedEvent> => ({
    event,
    play: () => Promise.resolve()
  });

  const buildSequence = (events: GameEvent[]) => {
    const steps = events.map(({ type, payload }) => {
      switch (type) {
        case END_TURN:
          return endTurnSequence({ type, payload });

        case ENTITY_MOVED:
          return entityMovedSequence({ type, payload });

        case ENTITY_DIED:
          return entityDiedSequence({ type, payload });

        case DEAL_DAMAGE:
          return dealDamageSequence({ type, payload });

        case SOLDIER_SUMMONED:
          return soldierSummonedSequence({ type, payload });

        case SKILL_USED:
          return skillUsedSequence({ type, payload });

        default:
          return exhaustiveSwitch(type);
      }
    });

    return {
      async play(state: Ref<GameState>, onStepComplete: (event: GameEvent) => void) {
        for (const step of steps) {
          await step.play(state.value, step.event as any);
          onStepComplete(step.event);
        }
      }
    };
  };

  return { buildSequence };
};
