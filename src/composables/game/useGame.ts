import type { Doc, Id } from '../../../convex/_generated/dataModel';
import { type GameState, createGameState } from '../../game-logic';
import type { ComputedRef } from 'vue';
import type { GameEvent } from '../../game-logic/events/reducer';
import type { EndTurnActionInput } from '../../game-logic/actions/endTurn';
import type { MoveActionInput } from '../../game-logic/actions/move';
import type { SkillActionInput } from '../../game-logic/actions/skill';
import type { SummonActionInput } from '../../game-logic/actions/summon';

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
  const api: Game = {
    state,
    game,
    me,
    sendAction
  };

  provide(GAME_INJECTION_KEY, api);

  return api;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
