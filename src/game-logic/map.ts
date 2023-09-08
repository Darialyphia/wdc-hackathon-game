import type { Point, Size } from '@/utils/geometry';

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
  rows: GameMapCell[][];
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
    rows: cells
  };
};
