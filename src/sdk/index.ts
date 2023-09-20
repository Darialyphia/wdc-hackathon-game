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
import { createGameMap, type GameMap } from './map';
import { tickUntilActiveEntity } from './atb';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  type GameLifecycleState,
  GAME_LIFECYCLE_STATES
} from './constants';
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
    entities: SerializedEntity[];
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
};

export const serializeGameState = (state: GameState): SerializedGameState => {
  return {
    ...state,
    entities: state.entities.map(serializeEntity)
  };
};

export const fromSerializedState = (serializedState: SerializedGameState): GameState => {
  return {
    ...serializedState,
    entities: serializedState.entities.map(deserializeEntity)
  };
};

export const createGameState = ({
  players,
  history = []
}: CreateGameOptions): GameState => {
  const state: GameState = {
    winner: null,
    lifecycleState: GAME_LIFECYCLE_STATES.STARTED,
    players: [players[0].id, players[1].id],
    nextEntityId: 0,
    activeEntityId: 0,
    map: createGameMap(MAP_WIDTH, MAP_HEIGHT),
    entities: [],
    history: [],
    globalAtb: 0,
    turn: 1,
    reducer: createReducer({ transient: false })
  };

  players.forEach((player, i) => {
    const general = generalsLookup[player.characterId as keyof typeof generalsLookup]!;
    addGeneral(state, general, {
      atbSeed: player.atbSeed,
      characterId: player.characterId,
      owner: player.id,
      position: { y: Math.floor(MAP_HEIGHT / 2), x: i === 0 ? 2 : MAP_WIDTH - 3 }
    });
  });

  tickUntilActiveEntity(state);

  if (history) {
    history.forEach(event => {
      if (!event.transient) {
        state.reducer(state, event);
      }
    });
  }
  return state;
};
