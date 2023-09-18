import { AStarFinder } from 'astar-typescript';
import type { GameState } from '..';
import { getCellAt, isCellTraversable, isCellWalkable } from './map.helpers';
import type { EntityId } from '../entity';
import { getEntityById } from './entity.helpers';
import type { GameMapCell } from '../map';

export const createPathFinder = (state: GameState, entityId: EntityId) => {
  const entity = getEntityById(state, entityId);
  if (!entity) throw new Error('could not find entity');

  const astarMatrix = state.map.rows.map(row =>
    row.map(cell => {
      if (cell === getCellAt(state, entity.position)) return 0;

      return isCellTraversable(state, cell, getEntityById(state, entityId)!) ? 0 : 1;
    })
  );

  return new AStarFinder({
    grid: {
      matrix: astarMatrix
    },
    diagonalAllowed: false,
    includeStartNode: false
  });
};
