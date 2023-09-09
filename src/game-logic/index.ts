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
import { getGeneralById } from './utils/entity.helpers';

// We do nothing with those imports in this file
// If we remove them we get circular import issues and underfined variables
// I'd look how to fix it but I HAVE BETTER THINGS TO DO
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { skills } from '@/resources/skills';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generals } from '@/resources/generals';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { soldiers } from '@/resources/soldiers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { factions } from '@/resources/factions';

export type GameState = {
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
