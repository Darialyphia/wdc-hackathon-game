import { isObject } from '../../utils/assertions';

import type { GameState } from '..';
import type { Entity, EntityId, General, PlayerId, Soldier } from '../entity';
import { tickUntilActiveEntity } from '../atb';

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
  const active = getActiveEntity(state);
  active.atb = active.atbSeed;

  tickUntilActiveEntity(state);
};
