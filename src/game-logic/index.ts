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
import { soldiersByFaction } from '../resources/soldiers';
import { generals } from '@/resources/generals';

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
    map: createGameMap(MAP_WIDTH, MAP_HEIGHT),
    entities: []
  };

  players.forEach((player, i) => {
    const general = generals[player.characterId];
    addGeneral(state, general, {
      characterId: player.characterId,
      owner: player.id,
      position: { y: Math.floor(MAP_HEIGHT / 2), x: i === 0 ? 2 : MAP_WIDTH - 3 }
    });
  });

  tickUntilActiveEntity(state);

  return state;
};
