import type { GameState } from '.';
import type { Point } from '../utils/geometry';
import { MAX_ATB } from './constants';
import { type SoldierData, soldiersLookup } from './soldiers';
import { generalsLookup, type GeneralData } from './generals';
import type { Override, Values } from '../utils/types';
import type { SerializedTrigger, Trigger } from './trigger';
import type { Modifier, SerializedModifier } from './modifier';
import type { Aura, SerializedAura } from './aura';
import { triggersLookup } from './triggers';
import { aurasLookup } from './auras';
import { modifiersLookup } from './modifiers';
import { exhaustiveSwitch } from '../utils/assertions';

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
  apRegenRate: number;
  atb: number;
  attack: number;
  defense: number;
  speed: number;
  initiative: number;
  hp: number;
  triggers: Trigger[];
  modifiers: Modifier[];
  auras: Aura[];
  movedAmount: number;
};
export type Soldier = EntityBase & {
  readonly kind: 'soldier';
  readonly blueprint: SoldierData;
};
export type General = EntityBase & {
  readonly kind: 'general';
  readonly blueprint: GeneralData;
};
export type Entity = Soldier | General;

export type SerializedEntityBase = Override<
  EntityBase,
  {
    blueprint: CharacterId;
    triggers: SerializedTrigger[];
    modifiers: SerializedModifier[];
    auras: SerializedAura[];
  }
>;
export type SerializedSoldier = Override<Soldier, SerializedEntityBase>;
export type SerializedGeneral = Override<General, SerializedEntityBase>;
export type SerializedEntity = SerializedSoldier | SerializedGeneral;

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
    movedAmount: 0,
    atbSeed: options.atbSeed,
    atb: MAX_ATB + options.atbSeed,
    maxAp: blueprint.maxAp,
    ap: blueprint.maxAp,
    apRegenRate: blueprint.apRegenRate,
    hp: blueprint.maxHp,
    triggers: [...blueprint.triggers],
    modifiers: [],
    auras: blueprint.auras,
    initiative: blueprint.initiative,
    attack: blueprint.attack,
    defense: blueprint.defense,
    speed: blueprint.speed
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
    atb: MAX_ATB / 4 + options.atbSeed,
    maxAp: blueprint.maxAp,
    ap: blueprint.maxAp,
    apRegenRate: blueprint.apRegenRate,
    hp: blueprint.maxHp,
    triggers: [...blueprint.triggers],
    modifiers: [],
    auras: blueprint.auras,
    movedAmount: 0,
    initiative: blueprint.initiative,
    attack: blueprint.attack,
    defense: blueprint.defense,
    speed: blueprint.speed
  };
  state.entities.push(entity);
};

export const serializeEntity = (entity: Entity): SerializedEntity => {
  return {
    ...entity,
    blueprint: entity.blueprint.characterId,
    triggers: entity.triggers.map(trigger => ({
      id: trigger.id,
      duration: trigger.duration
    })),
    auras: entity.auras.map(aura => ({
      id: aura.id
    })),
    modifiers: entity.modifiers.map(modifier => ({
      id: modifier.id,
      from: modifier.from
    }))
  };
};

export const deserializeGeneral = (serializedEntity: SerializedGeneral): General => {
  return {
    ...serializedEntity,
    blueprint: generalsLookup[serializedEntity.blueprint as keyof typeof generalsLookup],
    triggers: serializedEntity.triggers.map(trigger => ({
      ...triggersLookup[trigger.id as keyof typeof triggersLookup],
      duration: trigger.duration
    })),
    auras: serializedEntity.auras.map(aura => ({
      ...aurasLookup[aura.id as keyof typeof aurasLookup]
    })),
    modifiers: serializedEntity.modifiers.map(modifier => ({
      ...modifiersLookup[modifier.id as keyof typeof modifiersLookup],
      from: modifier.from
    }))
  };
};

export const deserializeSoldier = (serializedEntity: SerializedSoldier): Soldier => {
  return {
    ...serializedEntity,
    blueprint: soldiersLookup[serializedEntity.blueprint as keyof typeof soldiersLookup],
    triggers: serializedEntity.triggers.map(trigger => ({
      ...triggersLookup[trigger.id as keyof typeof triggersLookup],
      duration: trigger.duration
    })),
    auras: serializedEntity.auras.map(aura => ({
      ...aurasLookup[aura.id as keyof typeof aurasLookup]
    })),
    modifiers: serializedEntity.modifiers.map(modifier => ({
      ...modifiersLookup[modifier.id as keyof typeof modifiersLookup],
      from: modifier.from
    }))
  };
};

export const deserializeEntity = (serializedEntity: SerializedEntity): Entity => {
  const { kind } = serializedEntity;
  switch (kind) {
    case 'general':
      return deserializeGeneral(serializedEntity);
    case 'soldier':
      return deserializeSoldier(serializedEntity);
    default:
      return exhaustiveSwitch(kind);
  }
};
