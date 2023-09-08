import type { GameState } from '.';
import type { Point } from '../utils/geometry';
import { DEFAULT_GENERAL_AP, DEFAULT_SOLDIER_AP } from './constants';
import type { SummonBlueprint } from './summon';

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
  maxAp: number;
  atb: number;
};

export type Soldier = EntityBase & {
  kind: 'soldier';
};
export type General = EntityBase & {
  kind: 'general';
  summonBlueprints: Record<CharacterId, SummonBlueprint>;
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

export const addGeneral = (
  state: GameState,
  entity: Pick<General, 'owner' | 'characterId' | 'position' | 'summonBlueprints'>
) => {
  const atbSeed = Math.random();

  state.entities.push({
    ...entity,
    kind: 'general',
    id: ++state.nextEntityId,
    atbSeed,
    atb: atbSeed,
    maxAp: DEFAULT_GENERAL_AP,
    ap: DEFAULT_GENERAL_AP
  });
};

export const addSoldier = (
  state: GameState,
  entity: Pick<Soldier, 'owner' | 'characterId' | 'position'>
) => {
  const atbSeed = Math.random();

  state.entities.push({
    ...entity,
    kind: 'soldier',
    id: ++state.nextEntityId,
    atbSeed,
    atb: atbSeed,
    maxAp: DEFAULT_SOLDIER_AP,
    ap: DEFAULT_SOLDIER_AP
  });
};
