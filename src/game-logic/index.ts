import {
  addGeneral,
  type CharacterId,
  type Entity,
  type EntityId,
  type PlayerId
} from './entity';
import { createGameMap, type GameMap } from './map';
import { tickUntilActiveEntity } from './atb';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';
import { reducer, type GameEvent } from './events/reducer';
import type { Nullable, Values } from '../utils/types';
import { getGeneralById } from '../resources/generals';

export const GAME_LIFECYCLE_STATES = {
  STARTED: 'STARTED',
  FINISHED: 'FINISHED'
} as const;

export type GameLifecycleState = Values<typeof GAME_LIFECYCLE_STATES>;

export type GameState = {
  lifecycleState: GameLifecycleState;
  winner: Nullable<PlayerId>;
  players: [PlayerId, PlayerId];
  nextEntityId: number;
  activeEntityId: EntityId;
  map: GameMap;
  entities: Entity[];
  history: GameEvent[];
};

type CreateGamOptionsPlayer = {
  id: PlayerId;
  characterId: CharacterId;
  atbSeed: number;
};
export type CreateGameOptions = {
  players: [CreateGamOptionsPlayer, CreateGamOptionsPlayer];
  history?: GameEvent[];
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
    history: []
  };

  players.forEach((player, i) => {
    const general = getGeneralById(player.characterId)!;
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
      reducer(state, event);
    });
  }
  return state;
};
