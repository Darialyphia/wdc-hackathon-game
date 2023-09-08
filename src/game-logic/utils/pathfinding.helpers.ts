import { AStarFinder } from 'astar-typescript';
import type { GameState } from '..';
import { getCellAt, isCellWalkable } from './map.helpers';
import type { EntityId } from '../entity';
import { getEntityById } from './entity.helpers';

export const createPathFinder = (state: GameState, entityId: EntityId) => {
  const entity = getEntityById(state, entityId);
  if (!entity) throw new Error('could not find entity');

  const astarMatrix = state.map.rows.map(row =>
    row.map(cell => {
      if (cell === getCellAt(state, entity.position)) return 0;
      return isCellWalkable(state, cell) ? 0 : 1;
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
