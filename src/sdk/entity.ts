import type { GameState } from '.';
import type { Point } from '../utils/geometry';
import { DEFAULT_GENERAL_AP, DEFAULT_SOLDIER_AP, MAX_ATB } from './constants';
import type { SoldierData } from './soldiers';
import type { GeneralData } from './generals';
import type { Values } from '../utils/types';
import type { Trigger } from './trigger';
import { applyModifier, type Modifier } from './modifier';
import type { Aura } from './aura';

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
  readonly id: EntityId;
  readonly atbSeed: number;
  characterId: CharacterId;
  owner: PlayerId;
  state: EntityState;
  position: Point;
  maxAp: number;
  ap: number;
  atb: number;
  readonly attack: number;
  readonly defense: number;
  readonly initiative: number;
  hp: number;
  triggers: Trigger[];
  modifiers: Modifier[];
  auras: Aura[];
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
  options: Pick<General, 'owner' | 'characterId' | 'position' | 'atbSeed'>
) => {
  const entity: General = {
    ...options,
    state: ENTITY_STATES.ALIVE,
    blueprint,
    kind: 'general',
    id: ++state.nextEntityId,
    hasSummonned: false,
    atbSeed: options.atbSeed,
    atb: MAX_ATB + options.atbSeed,
    maxAp: DEFAULT_GENERAL_AP,
    ap: DEFAULT_GENERAL_AP,
    hp: blueprint.maxHp,
    triggers: [...blueprint.triggers],
    modifiers: [],
    auras: blueprint.auras,
    get initiative() {
      return applyModifier(entity, 'initiative');
    },
    get attack() {
      return applyModifier(entity, 'attack');
    },
    get defense() {
      return applyModifier(entity, 'defense');
    }
  };
  state.entities.push(entity);
};

export const addSoldier = (
  state: GameState,
  blueprint: SoldierData,
  options: Pick<Soldier, 'owner' | 'characterId' | 'position' | 'atbSeed'>
) => {
  const entity: Soldier = {
    ...options,
    state: ENTITY_STATES.ALIVE,
    blueprint,
    kind: 'soldier',
    id: ++state.nextEntityId,
    atbSeed: options.atbSeed,
    atb: options.atbSeed,
    maxAp: DEFAULT_SOLDIER_AP,
    ap: DEFAULT_SOLDIER_AP,
    hp: blueprint.maxHp,
    triggers: [...blueprint.triggers],
    modifiers: [],
    auras: blueprint.auras,
    get initiative() {
      return applyModifier(entity, 'initiative');
    },
    get attack() {
      return applyModifier(entity, 'attack');
    },
    get defense() {
      return applyModifier(entity, 'defense');
    }
  };
  state.entities.push(entity);
};
