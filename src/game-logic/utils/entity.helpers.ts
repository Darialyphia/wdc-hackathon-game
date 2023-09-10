import { isObject } from '../../utils/assertions';
import { exhaustiveSwitch } from '../../utils/assertions';
import type { GameState } from '..';
import type {
  CharacterId,
  Entity,
  EntityId,
  General,
  PlayerId,
  Soldier
} from '../entity';
import { tickUntilActiveEntity } from '../atb';
import { soldiers, soldiersByFaction } from '../../resources/soldiers';
import type { Point } from '../../utils/geometry';
import { generals } from '../../resources/generals';

export const getEntityById = (state: GameState, id: EntityId) =>
  state.entities.find(e => e.id === id);

export const isOwnEntity = (playerId: PlayerId, entity: Entity) => {
  return entity.owner === playerId;
};

export const isOpponentEntity = (playerId: PlayerId, entity: Entity) => {
  return entity.owner !== playerId;
};

export const isActive = (state: GameState, entity: Entity) => {
  return entity.id === state.activeEntityId;
};

export const isSoldier = (e: unknown): e is Soldier =>
  isObject(e) && 'kind' in e && e.kind === 'soldier';
export const isGeneral = (e: unknown): e is General =>
  isObject(e) && 'kind' in e && e.kind === 'general';

export const getActiveEntity = (state: GameState) =>
  state.entities.find(e => e.id === state.activeEntityId)!;

export const endTurn = (state: GameState) => {
  resetEntity(getActiveEntity(state));

  tickUntilActiveEntity(state);
};

export const getGeneral = (state: GameState, player: PlayerId) =>
  state.entities.find(e => e.owner === player && e.kind === 'general')! as General;

export const resetEntity = (entity: Entity) => {
  const { kind } = entity;
  switch (kind) {
    case 'general':
      entity.atb = entity.atbSeed;
      entity.hasSummonned = false;
      break;
    case 'soldier':
      entity.atb = entity.atbSeed;
      break;
    default:
      exhaustiveSwitch(kind);
  }
};

export const getSummonBlueprints = (entity: General) =>
  soldiersByFaction[entity.blueprint.factionId];

export const getEntityAt = (state: GameState, { x, y }: Point) =>
  state.entities.find(e => e.position.x === x && e.position.y === y);
