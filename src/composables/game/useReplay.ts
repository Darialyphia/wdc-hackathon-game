import type { ComputedRef } from 'vue';
import type { Id } from '../../../convex/_generated/dataModel';
import { createGameState } from '../../sdk';
import { createReducer, type GameEvent } from '../../sdk/events/reducer';
import type { SoldierData } from '../../sdk/soldiers';
import type { Nullable } from '../../utils/types';
import type { Entity } from '../../sdk/entity';
import { getActiveEntity } from '../../sdk/utils/entity.helpers';
import { createPathFinder } from '../../sdk/utils/pathfinding.helpers';
import { endTurnEvent } from '../../sdk/events/endTurn.event';
import { type FXSequenceContext } from './useFXSequencer';
import { parse } from 'zipson';
import type { ActionDispatcher, Game, GameDetail } from './useGame';
import type { SkillData } from '../../sdk/utils/entityData';

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
        state.value.reducer(state.value, event);
        if (isPlaying.value) {
          await waitFor(800);
          replayStep.value++;
        }
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
    const timelineReducer = createReducer({ persist: true });
    for (let i = 0; i < 10; i++) {
      timelineReducer(timelineState, endTurnEvent.create(timelineState.activeEntityId));
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
    me: null,
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
