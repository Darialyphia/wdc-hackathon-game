import type { GameState } from '.';
import type { Point } from '../utils/geometry';
import { MAX_ATB } from './constants';
import type { SoldierData } from './soldiers';
import type { GeneralData } from './generals';
import type { Values } from '../utils/types';
import type { Trigger } from './trigger';
import type { Modifier } from './modifier';
import type { Aura } from './aura';
import type { SkillId } from './utils/entityData';

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
  attack: number;
  defense: number;
  initiative: number;
  hp: number;
  triggers: Trigger[];
  modifiers: Modifier[];
  auras: Aura[];
  skillsUsed: SkillId[];
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
    maxAp: blueprint.maxAp,
    ap: blueprint.maxAp,
    hp: blueprint.maxHp,
    triggers: [...blueprint.triggers],
    modifiers: [],
    auras: blueprint.auras,
    skillsUsed: [],
    initiative: blueprint.initiative,
    attack: blueprint.attack,
    defense: blueprint.defense
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
    maxAp: blueprint.maxAp,
    ap: blueprint.maxAp,
    hp: blueprint.maxHp,
    triggers: [...blueprint.triggers],
    modifiers: [],
    auras: blueprint.auras,
    skillsUsed: [],
    initiative: blueprint.initiative,
    attack: blueprint.attack,
    defense: blueprint.defense
  };
  state.entities.push(entity);
};
