import { type AnyZodObject, z } from 'zod';
import {
  addEntity,
  type CharacterId,
  type Entity,
  type EntityId,
  type PlayerId
} from './entity';
import { createGameMap, type GameMap } from './map';
import { tickUntilActiveEntity } from './atb';

export type GameState = {
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
      position: { x: Math.floor(MAP_SIZE / 2), y: i === 0 ? 2 : MAP_SIZE - 2 }
    });
  });

  tickUntilActiveEntity(state);

  return state;
};
