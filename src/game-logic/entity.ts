import type { GameState } from '.';
import type { Point } from '../utils/geometry';
import { DEFAULT_GENERAL_AP, DEFAULT_SOLDIER_AP } from './constants';
import type { SoldierData } from '../resources/soldiers';
import type { GeneralData } from '@/resources/generals';
import type { Values } from '@/utils/types';

export type EntityId = number;
export type GameId = string;
export type PlayerId = string;
export type CharacterId = string;

export const ENTITY_STATES = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD'
} as const;

export type EntityState = Values<typeof ENTITY_STATES>;

export type EntityBase = {
  characterId: CharacterId;
  readonly id: EntityId;
  owner: PlayerId;
  state: EntityState;
  position: Point;
  readonly maxAp: number;
  ap: number;
  readonly atbSeed: number;
  atb: number;
  initiative: number;
  hp: number;
};

export type Soldier = EntityBase & {
  readonly kind: 'soldier';
  readonly blueprint: SoldierData;
};
export type General = EntityBase & {
  readonly kind: 'general';
  readonly blueprint: GeneralData;
  hasSummonned: boolean;
};

export type Entity = Soldier | General;

export const addGeneral = (
  state: GameState,
  blueprint: GeneralData,
  entity: Pick<General, 'owner' | 'characterId' | 'position' | 'atbSeed'>
) => {
  state.entities.push({
    ...entity,
    state: ENTITY_STATES.ALIVE,
    blueprint,
    kind: 'general',
    id: ++state.nextEntityId,
    hasSummonned: false,
    atbSeed: entity.atbSeed,
    atb: entity.atbSeed,
    maxAp: DEFAULT_GENERAL_AP,
    ap: DEFAULT_GENERAL_AP,
    initiative: blueprint.initiative,
    hp: blueprint.maxHp
  });
};

export const addSoldier = (
  state: GameState,
  blueprint: SoldierData,
  entity: Pick<Soldier, 'owner' | 'characterId' | 'position' | 'atbSeed'>
) => {
  state.entities.push({
    ...entity,
    state: ENTITY_STATES.ALIVE,
    blueprint,
    kind: 'soldier',
    id: ++state.nextEntityId,
    atbSeed: entity.atbSeed,
    atb: entity.atbSeed,
    maxAp: DEFAULT_SOLDIER_AP,
    ap: DEFAULT_SOLDIER_AP,
    initiative: blueprint.initiative,
    hp: blueprint.maxHp
  });
};
