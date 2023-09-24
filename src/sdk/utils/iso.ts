import { number } from 'zod';
import type { Point3D } from '../../utils/geometry';
import { CELL_SIZE } from '../constants';

export type IsoPoint = {
  isoX: number;
  isoY: number;
  isoZ: number;
};
const TILE_WIDTH = CELL_SIZE;
const TILE_HEIGHT = TILE_WIDTH / 2;

export const toIso = ({ x, y, z }: Point3D): IsoPoint => ({
  isoX: (x - y) * (TILE_WIDTH / 2),
  isoY: (x + y) * (TILE_HEIGHT / 2),
  isoZ: z * TILE_HEIGHT
});

export const getIsoDepth = ({ isoX, isoY, isoZ }: IsoPoint) => {
  const cartesian = {
    x: isoX / (TILE_WIDTH / 2),
    y: (isoY / (TILE_HEIGHT / 2)) * 2
  };

  return cartesian.x + cartesian.y + isoZ;
};
