import type { Point, Size } from '@/utils/geometry';
import type { GameState } from '.';

export const CELL_TYPES = {
  GROUND: 0, // walkable, doesn't block vision and projectiles
  WATER: 1, // not walkable, doesn't block vision or projectiles
  WALL: 2 // not walkable, blocks vision and projectiles
} as const;
export type CellType = 0 | 1 | 2; // GROUND / water / wall

export type GameMapCell = Point & {
  terrain: CellType;
};

export type GameMap = Size & {
  cells: GameMapCell[][];
};

export const getCellAt = (state: GameState, { x, y }: Point): GameMapCell | undefined =>
  state.map.cells[y]?.[x];

export const isWithinBounds = (state: GameState, { x, y }: Point) =>
  x >= 0 && y >= 0 && x < state.map.width && y < state.map.height;
export const isCellOccupied = (state: GameState, { x, y }: Point) => {
  return state.entities.some(e => e.position.x === x && e.position.y === y);
};
export const isCellWalkable = (state: GameState, { x, y }: Point) => {
  return (
    !isCellOccupied(state, { x, y }) &&
    getCellAt(state, { x, y })?.terrain === CELL_TYPES.GROUND
  );
};

export const createGameMap = (width: number, height: number): GameMap => {
  const cells = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const cell: GameMapCell = {
        x,
        y,
        terrain: CELL_TYPES.GROUND
      };

      return cell;
    })
  );

  return {
    width,
    height,
    cells
  };
};
