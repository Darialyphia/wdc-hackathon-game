import type { Point } from '@/utils/geometry';
import type { GameState } from '..';
import { type GameMapCell, CELL_TYPES } from '../map';

export const getCellAt = (state: GameState, { x, y }: Point): GameMapCell | undefined =>
  state.map.cells[y]?.[x];

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
