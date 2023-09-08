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
import type { SoldierData } from '../resources/soldiers';

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
  summonBlueprints: SoldierData[];
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
    addGeneral(state, {
      characterId: player.characterId,
      owner: player.id,
      summonBlueprints: Object.fromEntries(
        player.summonBlueprints.map(blueprint => [blueprint.id, blueprint])
      ),
      position: { y: Math.floor(MAP_HEIGHT / 2), x: i === 0 ? 2 : MAP_WIDTH - 3 }
    });
  });

  tickUntilActiveEntity(state);

  return state;
};
