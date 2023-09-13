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
import gsap, { Power2 } from 'gsap';
import { Container, AnimatedSprite } from 'pixi.js';
import type { EntityId } from '../../game-logic/entity';
import { Power1 } from 'gsap';
import type { MaybeRefOrGetter } from '@vueuse/core';
import { getSkillById } from '../../game-logic/utils/skill.helper';
import { getSoldierById } from '../../resources/soldiers';
import type { AssetsContext } from './useAssets';
import { CELL_SIZE } from '../../game-logic/constants';

export type FXSequenceStep<T extends GameEvent> = {
  event: T;
  play: (state: GameState, event: T) => Promise<void>;
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
  const assetsLookup = new Map<
    EntityId,
    {
      sprite: MaybeRefOrGetter<AnimatedSprite | undefined>;
    }
  >();

  const linkSprite = (
    id: EntityId,
    sprite: MaybeRefOrGetter<AnimatedSprite | undefined>
  ) => {
    assetsLookup.set(id, { sprite });
  };

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

        const ap = entity.ap;
        gsap.to(entity, {
          duration: 0.3,
          ease: Power2.easeOut,
          delay: 0,
          onComplete: () => {
            // set back hp to old value because the game reducer will decrease it as well
            entity.ap = ap;
          },
          ap: entity.ap - 1
        });

        gsap.to(entity.position, {
          duration: 0.3,
          ease: Power1.easeOut,
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
    play: (state, { payload }) =>
      new Promise(resolve => {
        const entity = getEntityById(state, event.payload.targetId)!;
        const hp = entity.hp;
        gsap.to(entity, {
          duration: 0.3,
          ease: Power2.easeOut,
          onComplete: () => {
            // set back hp to old value because the game reducer will decrease it as well
            entity.hp = hp;
            resolve();
          },
          delay: 0,
          hp: entity.hp - payload.amount
        });
      })
  });

  const soldierSummonedSequence = (
    event: SoldierSummonedEvent
  ): FXSequenceStep<SoldierSummonedEvent> => ({
    event,
    play: (state, { payload }) =>
      new Promise(resolve => {
        const entity = getEntityById(state, event.payload.sourceId)!;

        const ap = entity.ap;
        gsap.to(entity, {
          duration: 0.3,
          ease: Power2.easeOut,
          delay: 0,
          onComplete: () => {
            // set back hp to old value because the game reducer will decrease it as well
            entity.ap = ap;
          },
          ap: entity.ap - getSoldierById(payload.characterId)!.cost
        });

        const sheet = assetsCtx.resolveFx('summoningCircle');
        const summonCircle = new AnimatedSprite(
          createSpritesheetFrameObject('idle', sheet)
        );
        summonCircle.position.set(
          payload.position.x * CELL_SIZE + CELL_SIZE / 2,
          payload.position.y * CELL_SIZE + CELL_SIZE / 2
        );
        summonCircle.loop = false;
        summonCircle.onFrameChange = frame => {
          if (frame > summonCircle.totalFrames / 2) {
            resolve();
            summonCircle.onFrameChange = undefined;
          }
        };
        summonCircle.onComplete = () => {
          summonCircle.destroy();
        };
        summonCircle.anchor.set(0.5);

        fxContainer.addChild(summonCircle);
        summonCircle.play();
      })
  });

  const skillUsedSequence = (event: SkillUsedEvent): FXSequenceStep<SkillUsedEvent> => ({
    event,
    play: (state, { payload }) => {
      return new Promise(resolve => {
        const entity = getEntityById(state, event.payload.sourceId)!;

        const ap = entity.ap;
        gsap.to(entity, {
          duration: 0.3,
          ease: Power2.easeOut,
          delay: 0,
          onComplete: () => {
            // set back hp to old value because the game reducer will decrease it as well
            entity.ap = ap;
          },
          ap: entity.ap - getSkillById(payload.skillId)!.cost
        });

        // play attack animation
        const assets = assetsLookup.get(payload.sourceId);
        if (!assets) return resolve();
        const sheet = assetsCtx.resolveSprite(entity.blueprint.spriteId);
        const sprite = toValue(assets.sprite);
        if (!sprite) return resolve();

        sprite.textures = createSpritesheetFrameObject('attacking', sheet);
        sprite.gotoAndPlay(0);
        sprite.loop = false;
        sprite.onComplete = () => {
          sprite.textures = createSpritesheetFrameObject('idle', sheet);
          sprite.gotoAndPlay(0);
          sprite.loop = true;
          sprite.onComplete = undefined;
          resolve();
        };
      });
    }
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

  provide(FX_SEQUENCER_INJECTION_KEY, { linkSprite, buildSequence, fxContainer });
  return { buildSequence, linkSprite, fxContainer };
};

export const useFXSequencer = () => useSafeInject(FX_SEQUENCER_INJECTION_KEY);
