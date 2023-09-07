import type { GameState } from '.';
import type { Point, Size } from '../utils/geometry';
import { DEFAULT_GENERAL_AP, DEFAULT_SOLDIER_AP } from './constants';

export type EntityId = number;
export type GameId = string;
export type PlayerId = string;
export type CharacterId = string;

export type EntityBase = {
  owner: PlayerId;
  characterId: CharacterId;
  id: EntityId;
  position: Point;
  ap: number;
  atbSeed: number;
  atb: number;
};

export type Soldier = EntityBase & {
  kind: 'soldier';
};
export type General = EntityBase & {
  kind: 'general';
};

export type Entity = Soldier | General;

const getDefaultAp = (kind: Entity['kind']) => {
  switch (kind) {
    case 'soldier':
      return DEFAULT_SOLDIER_AP;
    case 'general':
      return DEFAULT_GENERAL_AP;
    default:
      return exhaustiveSwitch(kind);
  }
};

export const addEntity = (
  state: GameState,
  entity: Omit<Entity, 'id' | 'atbSeed' | 'atb' | 'ap'>
) => {
  const atbSeed = Math.random();

  state.entities.push({
    ...entity,
    id: ++state.nextEntityId,
    atbSeed,
    atb: atbSeed,
    ap: getDefaultAp(entity.kind)
  });
};
