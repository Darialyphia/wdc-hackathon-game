import {
  addEntity,
  type CharacterId,
  type Entity,
  type EntityId,
  type PlayerId
} from './entity';
import { createGameMap, type GameMap } from './map';
import { tickUntilActiveEntity } from './atb';
import { MAP_SIZE } from './constants';

export type GameState = {
  players: [PlayerId, PlayerId];
  nextEntityId: number;
  activeEntityId: EntityId;
  map: GameMap;
  entities: Entity[];
};

type CreateGamOptionsPlayer = {
  id: PlayerId;
  characterId: CharacterId;
};
export type CreateGameOptions = {
  players: [CreateGamOptionsPlayer, CreateGamOptionsPlayer];
};

export const createGameState = ({ players }: CreateGameOptions): GameState => {
  const state: GameState = {
    players: [players[0].id, players[1].id],
    nextEntityId: 0,
    activeEntityId: 0,
    map: createGameMap(MAP_SIZE, MAP_SIZE),
    entities: []
  };

  players.forEach((player, i) => {
    addEntity(state, {
      kind: 'general',
      characterId: player.characterId,
      owner: player.id,
      position: { y: Math.floor(MAP_SIZE / 2), x: i === 0 ? 2 : MAP_SIZE - 3 }
    });
  });

  tickUntilActiveEntity(state);

  return state;
};
