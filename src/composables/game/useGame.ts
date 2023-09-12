import type { WritableComputedRef, ComputedRef, Ref } from 'vue';
import type { Doc, Id } from '../../../convex/_generated/dataModel';
import { type GameState, createGameState } from '../../game-logic';
import type { GameEvent } from '../../game-logic/events/reducer';
import type { EndTurnActionInput } from '../../game-logic/actions/endTurn';
import type { MoveActionInput } from '../../game-logic/actions/move';
import type { SkillActionInput } from '../../game-logic/actions/skill';
import type { SummonActionInput } from '../../game-logic/actions/summon';
import type { SoldierData } from '../../resources/soldiers';
import type { Nullable } from '../../utils/types';
import type { SkillData } from '../../resources/skills';
import type { Entity } from '../../game-logic/entity';
import { getActiveEntity } from '../../game-logic/utils/entity.helpers';
import { createPathFinder } from '../../game-logic/utils/pathfinding.helpers';
import type { AStarFinder } from 'astar-typescript';

type GameDetail = Omit<Doc<'games'>, 'creator'> & { events: Doc<'gameEvents'>[] } & {
  players: Doc<'gamePlayers'>[];
};

export type Action =
  | { type: 'move'; payload: Omit<MoveActionInput, 'playerId'> }
  | { type: 'summon'; payload: Omit<SummonActionInput, 'playerId'> }
  | { type: 'use_skill'; payload: Omit<SkillActionInput, 'playerId'> }
  | { type: 'end_turn'; payload: Omit<EndTurnActionInput, 'playerId'> };

export type ActionDispatcher = (arg: Action) => void;

export type Game = {
  me: Id<'users'>;
  game: ComputedRef<GameDetail>;
  state: ComputedRef<GameState>;
  sendAction: ActionDispatcher;
  activeEntity: ComputedRef<Entity>;
  selectedSummon: WritableComputedRef<Nullable<SoldierData>>;
  selectedSkill: WritableComputedRef<Nullable<SkillData>>;
  selectedEntity: Ref<Entity>;
  isMyTurn: ComputedRef<boolean>;
  pathfinder: ComputedRef<AStarFinder>;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<Game>;

export const useGameProvider = (
  game: ComputedRef<GameDetail>,
  sendAction: ActionDispatcher,
  me: Id<'users'>
) => {
  const state = computed(() =>
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
      history: game.value.events.map(
        e => ({ type: e.type, payload: e.payload }) as GameEvent
      )
    })
  );

  const activeEntity = computed(() => getActiveEntity(state.value));

  const selectedSummon = ref<Nullable<SoldierData>>();
  const selectedSkill = ref<Nullable<SkillData>>();
  const selectedEntity = ref<Entity>(getActiveEntity(state.value));

  watchEffect(() => {
    selectedEntity.value = getActiveEntity(state.value);
  });

  const selectSummon = (summon: SoldierData) => {
    selectedSummon.value = summon;
    selectedSkill.value = null;
  };

  const selectSkill = (skill: SkillData) => {
    selectedSkill.value = skill;
    selectedSummon.value = null;
  };

  const isMyTurn = computed(() => activeEntity.value.owner === me);

  const pathfinder = computed(() =>
    createPathFinder(state.value, state.value.activeEntityId)
  );

  const api: Game = {
    state,
    game,
    pathfinder,
    me,
    isMyTurn,
    sendAction,
    activeEntity,
    selectedEntity,
    selectedSummon: computed({
      get() {
        return selectedSummon.value;
      },
      set(val) {
        if (!val) return;
        selectSummon(val);
      }
    }),
    selectedSkill: computed({
      get() {
        return selectedSkill.value;
      },
      set(val) {
        if (!val) return;
        selectSkill(val);
      }
    })
  };

  provide(GAME_INJECTION_KEY, api);

  return api;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
