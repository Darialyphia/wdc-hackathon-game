import {
  addGeneral,
  serializeEntity,
  type CharacterId,
  type Entity,
  type EntityId,
  type PlayerId,
  type SerializedEntity,
  deserializeEntity
} from './entity';
import { createGameMap, type GameMap, type SerializedMap } from './map';
import { tickUntilActiveEntity } from './atb';
import { type GameLifecycleState, GAME_LIFECYCLE_STATES } from './constants';
import { createReducer, type GameEvent, type GameReducer } from './events/reducer';
import type { Nullable, Override } from '../utils/types';
import { generalsLookup } from './generals';

export type GameState = {
  lifecycleState: GameLifecycleState;
  winner: Nullable<PlayerId>;
  players: [PlayerId, PlayerId];
  nextEntityId: number;
  activeEntityId: EntityId;
  map: GameMap;
  entities: Entity[];
  history: GameEvent[];
  globalAtb: number;
  turn: number;
  reducer: GameReducer;
};

export type SerializedGameState = Override<
  GameState,
  {
    map: SerializedMap;
    entities: SerializedEntity[];
    reducer?: undefined;
  }
>;
type CreateGameOptionsPlayer = {
  id: PlayerId;
  characterId: CharacterId;
  atbSeed: number;
};
export type CreateGameOptions = {
  players: [CreateGameOptionsPlayer, CreateGameOptionsPlayer];
  history?: GameEvent[];
  map: SerializedMap;
};

export const serializeGameState = (state: GameState): SerializedGameState => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { reducer, ...rest } = state;

  return {
    ...rest,
    map: state.map.raw,
    entities: state.entities.map(serializeEntity),
    history: []
  };
};

export const fromSerializedState = (serializedState: SerializedGameState): GameState => {
  return {
    ...serializedState,
    map: createGameMap(serializedState.map.map, serializedState.map.tileset),
    reducer: createReducer(),
    entities: serializedState.entities.map(deserializeEntity)
  };
};

export const createGameState = ({
  players,
  history = [],
  map
}: CreateGameOptions): GameState => {
  const state: GameState = {
    winner: null,
    lifecycleState: GAME_LIFECYCLE_STATES.STARTED,
    players: [players[0].id, players[1].id],
    nextEntityId: 0,
    activeEntityId: 0,
    map: createGameMap(map.map, map.tileset),
    entities: [],
    history: [],
    globalAtb: 0,
    turn: 1,
    reducer: createReducer()
  };

  players.forEach((player, i) => {
    const general = generalsLookup[player.characterId as keyof typeof generalsLookup]!;
    addGeneral(state, general, {
      atbSeed: player.atbSeed,
      characterId: player.characterId,
      owner: player.id,
      position: {
        y: Math.floor(state.map.height / 2),
        x: i === 0 ? 2 : state.map.width - 3
      }
    });
  });

  tickUntilActiveEntity(state);

  if (history) {
    history.forEach(event => {
      state.reducer(state, event);
    });
  }
  return state;
};
