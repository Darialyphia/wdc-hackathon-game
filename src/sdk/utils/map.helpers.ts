import type { Point } from '../../utils/geometry';
import type { GameState } from '..';
import { type GameMapCell, CELL_TYPES } from '../map';
import { isDefined } from '../../utils/assertions';
import { getEntityAt } from './entity.helpers';
import type { Entity } from '../entity';

export const getCellAt = (state: GameState, { x, y }: Point): GameMapCell | undefined =>
  state.map.rows[y]?.[x];

export const isWithinBounds = (state: GameState, { x, y }: Point) =>
  x >= 0 && y >= 0 && x < state.map.width && y < state.map.height;

export const isCellOccupied = (state: GameState, { x, y }: Point) => {
  return state.entities.some(e => e.position.x === x && e.position.y === y);
};

export const isCellWalkable = (state: GameState, { x, y }: Point) => {
  return (
    isWithinBounds(state, { x, y }) &&
    !isCellOccupied(state, { x, y }) &&
    getCellAt(state, { x, y })?.terrain === CELL_TYPES.GROUND
  );
};

// can a unit go through this cell while moving, but not land on it
export const isCellTraversable = (state: GameState, { x, y }: Point, entity: Entity) => {
  const entityOnCell = getEntityAt(state, { x, y });

  return (
    isWithinBounds(state, { x, y }) &&
    (!entityOnCell || entityOnCell.owner === entity.owner) &&
    getCellAt(state, { x, y })?.terrain === CELL_TYPES.GROUND
  );
};
export const getSurroundingCells = (state: GameState, { x, y }: Point) => {
  return [
    getCellAt(state, { x: x - 1, y: y - 1 }), //top left
    getCellAt(state, { x: x, y: y - 1 }), // top
    getCellAt(state, { x: x + 1, y: y - 1 }), // top right
    getCellAt(state, { x: x - 1, y: y }), // left
    getCellAt(state, { x: x + 1, y: y }), // right
    getCellAt(state, { x: x - 1, y: y + 1 }), //bottom left
    getCellAt(state, { x: x, y: y + 1 }), // bottom
    getCellAt(state, { x: x + 1, y: y + 1 }) // bottom right
  ].filter(isDefined);
};
