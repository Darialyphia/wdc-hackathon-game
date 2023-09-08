import type { GameState } from '.';
import type { Point } from '../utils/geometry';
import { DEFAULT_GENERAL_AP, DEFAULT_SOLDIER_AP } from './constants';
import type { SoldierData } from '../resources/soldiers';
import type { GeneralData } from '@/resources/generals';

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
  initiative: number;
};

export type Soldier = EntityBase & {
  kind: 'soldier';
};
export type General = EntityBase & {
  kind: 'general';
  summonBlueprints: Record<CharacterId, SoldierData>;
  hasSummonned: boolean;
};

export type Entity = Soldier | General;

export const addGeneral = (
  state: GameState,
  blueprint: GeneralData,
  entity: Pick<General, 'owner' | 'characterId' | 'position' | 'summonBlueprints'>
) => {
  const atbSeed = Math.random();

  state.entities.push({
    ...entity,
    kind: 'general',
    id: ++state.nextEntityId,
    hasSummonned: false,
    atbSeed,
    atb: atbSeed,
    maxAp: DEFAULT_GENERAL_AP,
    ap: DEFAULT_GENERAL_AP,
    initiative: blueprint.initiative
  });
};

export const addSoldier = (
  state: GameState,
  blueprint: SoldierData,
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
    ap: DEFAULT_SOLDIER_AP,
    initiative: blueprint.initiative
  });
};
