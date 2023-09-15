import { type Ref } from 'vue';
import type { GameState } from '../../game-logic';
import { DEAL_DAMAGE, dealDamageEvent } from '../../game-logic/events/dealDamage.event';
import { END_TURN, endTurnEvent } from '../../game-logic/events/endTurn.event';
import { ENTITY_DIED, entityDiedEvent } from '../../game-logic/events/entityDied.event';
import {
  ENTITY_MOVED,
  entityMovedEvent
} from '../../game-logic/events/entityMoved.event';
import { type GameEvent } from '../../game-logic/events/reducer';
import { SKILL_USED, skillUsedEvent } from '../../game-logic/events/skillUsed.event';
import {
  SOLDIER_SUMMONED,
  soldierSummonedEvent
} from '../../game-logic/events/soldierSummoned.event';
import { Container, AnimatedSprite } from 'pixi.js';
import type { EntityId } from '../../game-logic/entity';
import type { MaybeRefOrGetter } from '@vueuse/core';
import type { AssetsContext } from './useAssets';
import type { EventSequence } from '../../game-logic/events';

export type FXSequenceStep<T extends { type: string; payload: any }> = {
  event: T;
  play: EventSequence<T>;
};

export type FXSequence = {
  play(state: Ref<GameState>, onStepComplete: (event: GameEvent) => void): Promise<void>;
};

export type FXSequenceContext = {
  linkSprite(id: EntityId, sprite: MaybeRefOrGetter<AnimatedSprite | undefined>): void;
  buildSequence(events: GameEvent[]): FXSequence;
  fxContainer: Container;
};

export const FX_SEQUENCER_INJECTION_KEY = Symbol(
  'fx_sequencer'
) as InjectionKey<FXSequenceContext>;

export const useFXSequencerProvider = (assetsCtx: AssetsContext) => {
  const fxContainer = new Container();
  const spritesMap = new Map<
    EntityId,
    {
      sprite: MaybeRefOrGetter<AnimatedSprite | undefined>;
    }
  >();

  const linkSprite = (
    id: EntityId,
    sprite: MaybeRefOrGetter<AnimatedSprite | undefined>
  ) => {
    spritesMap.set(id, { sprite });
  };

  const buildSequence = (events: GameEvent[]) => {
    const steps = events.map(event => {
      const { type } = event;

      switch (type) {
        case END_TURN:
          return { event, play: endTurnEvent.sequence };

        case ENTITY_MOVED:
          return { event, play: entityMovedEvent.sequence };

        case ENTITY_DIED:
          return { event, play: entityDiedEvent.sequence };

        case DEAL_DAMAGE:
          return { event, play: dealDamageEvent.sequence };

        case SOLDIER_SUMMONED:
          return { event, play: soldierSummonedEvent.sequence };

        case SKILL_USED:
          return { event, play: skillUsedEvent.sequence };

        default:
          return exhaustiveSwitch(type);
      }
    });

    return {
      async play(state: Ref<GameState>, onStepComplete: (event: GameEvent) => void) {
        for (const step of steps) {
          await step.play(state.value, step.event as any, {
            assets: assetsCtx,
            fxContainer,
            sprites: {
              resolve(id: EntityId) {
                const asset = spritesMap.get(id);
                if (!asset) return null;
                return toValue(asset.sprite);
              }
            }
          });
          await onStepComplete(step.event);
        }
      }
    };
  };

  provide(FX_SEQUENCER_INJECTION_KEY, { linkSprite, buildSequence, fxContainer });
  return { buildSequence, linkSprite, fxContainer };
};

export const useFXSequencer = () => useSafeInject(FX_SEQUENCER_INJECTION_KEY);
