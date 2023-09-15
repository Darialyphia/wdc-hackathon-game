import type { ComputedRef } from 'vue';
import type { Id } from '../../../convex/_generated/dataModel';
import { createGameState } from '../../game-logic';
import { reducer, type GameEvent } from '../../game-logic/events/reducer';
import type { SoldierData } from '../../resources/soldiers';
import type { Nullable } from '../../utils/types';
import type { SkillData } from '../../resources/skills';
import type { Entity } from '../../game-logic/entity';
import { getActiveEntity } from '../../game-logic/utils/entity.helpers';
import { createPathFinder } from '../../game-logic/utils/pathfinding.helpers';
import { endTurnEvent } from '../../game-logic/events/endTurn.event';
import { type FXSequenceContext } from './useFXSequencer';
import { parse } from 'zipson';
import type { ActionDispatcher, Game, GameDetail } from './useGame';

const noop = () => {
  return;
};

const waitFor = (duration: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, duration);
  });

export const useReplayProvider = (
  game: ComputedRef<GameDetail>,
  sendAction: ActionDispatcher,
  me: Id<'users'>,
  sequencer: FXSequenceContext,
  replayStep: Ref<number>,
  isPlaying: Ref<boolean>
) => {
  const gameEvents = computed<GameEvent[]>(() => {
    if (!game.value.history) return [];
    return parse(game.value.history).slice(0, replayStep.value);
  });

  const state = ref(
    createGameState({
      players: [
        {
          id: game.value.players[0].userId,
          characterId: game.value.players[0].generalId,
          atbSeed: game.value.players[0].atbSeed
        },
        {
          id: game.value.players[1].userId,
          characterId: game.value.players[1].generalId,
          atbSeed: game.value.players[1].atbSeed
        }
      ],
      history: gameEvents.value
      // game.value.events.map(
      //   e => ({ type: e.type, payload: e.payload }) as GameEvent
      // )
    })
  );

  watch(
    () => gameEvents.value.length,
    (newLength, oldLength) => {
      const newEvents = gameEvents.value.slice(
        -1 * (newLength - oldLength)
      ) as GameEvent[];
      const sequence = sequencer.buildSequence(newEvents);

      sequence.play(state, async event => {
        if (isPlaying.value) {
          await waitFor(1000);
        }
        reducer(state.value, event);
        replayStep.value++;
      });
    }
  );

  const activeEntity = computed(() => getActiveEntity(state.value));

  const selectedSummon = ref<Nullable<SoldierData>>();
  const selectedSkill = ref<Nullable<SkillData>>();
  const selectedEntity = ref<Nullable<Entity>>(null);
  const isMyTurn = computed(() => false);

  const pathfinder = computed(() =>
    createPathFinder(state.value, state.value.activeEntityId)
  );

  const isInCastRange = () => false;
  const canSummonAt = () => false;
  const canCastAt = () => false;
  const move = noop;
  const summon = noop;
  const useSkill = noop;
  const endTurn = noop;

  const atbTimeline = computed(() => {
    const timelineState = createGameState({
      players: [
        {
          id: game.value.players[0].userId,
          characterId: game.value.players[0].generalId,
          atbSeed: game.value.players[0].atbSeed
        },
        {
          id: game.value.players[1].userId,
          characterId: game.value.players[1].generalId,
          atbSeed: game.value.players[1].atbSeed
        }
      ],
      history: gameEvents.value.map(
        e => ({ type: e.type, payload: e.payload }) as GameEvent
      )
    });

    const timeline = [getActiveEntity(timelineState)];
    for (let i = 0; i < 10; i++) {
      reducer(timelineState, endTurnEvent.create(timelineState.activeEntityId));
      timeline.push(getActiveEntity(timelineState));
    }
    return timeline;
  });

  const targetMode = ref(null);
  const hoveredCell = ref(null);
  const api: Game = {
    state,
    game,
    pathfinder,
    me,
    isMyTurn,
    sendAction,
    activeEntity,
    selectedEntity,
    move,
    summon,
    useSkill,
    endTurn,
    atbTimeline,
    targetMode,
    hoveredCell,
    canSummonAt,
    canCastAt,
    isInCastRange,
    selectedSummon: computed({
      get() {
        return selectedSummon.value;
      },
      set() {
        return;
      }
    }),
    selectedSkill: computed({
      get() {
        return selectedSkill.value;
      },
      set() {
        return;
      }
    })
  };

  provide(GAME_INJECTION_KEY, api);

  return api;
};
