import type { Point, Size } from '../utils/geometry';

export type EntityId = number;
export type GameId = string;
export type PlayerId = string;
export type CharacterId = string;

export type EntityBase = {
  owner: PlayerId;
  characterId: CharacterId;
  id: EntityId;
  position: Point;
};

export type Soldier = EntityBase & {
  kind: 'soldier';
};
export type General = EntityBase & {
  kind: 'general';
};

export type Entity = Soldier | General;

export type GameState = {
  nextEntityId: number;
  map: Size;
  entities: Entity[];
};
export const MAP_SIZE = 15;

type CreateGamOptionsPlayer = {
  id: PlayerId;
  characterId: CharacterId;
};
export type CreateGameOptions = {
  players: [CreateGamOptionsPlayer, CreateGamOptionsPlayer];
};

export const addEntity = (state: GameState, entity: Omit<Entity, 'id'>) => {
  state.entities.push({
    ...entity,
    id: ++state.nextEntityId
  });
};

export const createGameState = (opts: CreateGameOptions): GameState => {
  const state: GameState = {
    nextEntityId: 0,
    map: {
      width: MAP_SIZE,
      height: MAP_SIZE
    },
    entities: []
  };

  opts.players.forEach((player, i) => {
    addEntity(state, {
      kind: 'general',
      characterId: player.characterId,
      owner: player.id,
      position: { x: Math.floor(MAP_SIZE / 2), y: i === 0 ? 2 : MAP_SIZE - 2 }
    });
  });

  return state;
};
