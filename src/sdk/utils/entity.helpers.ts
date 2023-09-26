import { isObject } from '../../utils/assertions';
import { exhaustiveSwitch } from '../../utils/assertions';
import type { GameState } from '..';
import type { Entity, EntityId, General, PlayerId, Soldier } from '../entity';
import { tickUntilActiveEntity } from '../atb';
import type { Point } from '../../utils/geometry';

export const getEntityById = (state: GameState, id: EntityId) =>
  state.entities.find(e => e.id === id);

export const isAlly = (playerId: PlayerId, entity: Entity) => {
  return entity.owner === playerId;
};

export const isEnemy = (playerId: PlayerId, entity: Entity) => {
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

export const getEnemyGeneral = (state: GameState, player: PlayerId) =>
  state.entities.find(e => e.owner !== player && e.kind === 'general')! as General;

export const resetEntity = (entity: Entity) => {
  const { kind } = entity;
  switch (kind) {
    case 'general':
      entity.atb = entity.atbSeed;
      entity.movedAmount = 0;
      entity.skillsUsed = [];
      break;
    case 'soldier':
      entity.atb = entity.atbSeed;
      entity.movedAmount = 0;
      entity.skillsUsed = [];
      break;
    default:
      exhaustiveSwitch(kind);
  }
};

export const getEntityAt = (state: GameState, { x, y }: Point) =>
  state.entities.find(e => e.position.x === x && e.position.y === y);

export const getEntityDistance = (entity1: Entity, entity2: Entity) => {
  return {
    x: Math.abs(entity1.position.x - entity2.position.x),
    y: Math.abs(entity1.position.y - entity2.position.y)
  };
};

export const hasFinishedTurn = (entity: Entity) =>
  entity.movedAmount === entity.speed &&
  entity.ap === 0 &&
  entity.blueprint.skills.every(
    skill => skill.cost > 0 || entity.skillsUsed.includes(skill.id)
  );
