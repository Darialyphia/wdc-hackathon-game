import {
  ITiledMapTileLayer,
  ITiledMapTile,
  ITiledMap,
  ITiledMapTileset
} from '@workadventure/tiled-map-type-guard';
import type { Point } from './geometry';

export type GameTile = Point & {
  id: number;
};

export type GameTiledMap = {
  width: number;
  height: number;
  tiles: GameTile[];
  getTileAt: (coords: Point) => GameTile;
};

// const getTileProperty = <T>(
//   tile: ITiledMapTile,
//   propName: string,
//   defaultValue: T
// ): T => {
//   const prop = tile.properties?.find(prop => prop.name === propName);

//   return prop ? (prop.value as T) : defaultValue;
// };

const getGlobalTiles = (map: ITiledMap) => {
  const layoutLayer = map.layers.find(layer => layer.name === 'layout') as
    | ITiledMapTileLayer
    | undefined;

  if (!layoutLayer) {
    throw new Error(`Missing layout layer for map`);
  }

  // technically Tiled can output an encoded base64 string for map data but it seems to...not do it ?
  // tried a 300 * 300 map and it was still a number array...
  return layoutLayer.data as number[];
};

// https://doc.mapeditor.org/en/latest/reference/global-tile-ids
const getTileOffset = (map: ITiledMap, gid: number) => {
  return map.tilesets.reduce((current, tileset) => {
    const { firstgid } = tileset;
    if (!firstgid) return current;
    if (firstgid > gid) return current;
    if (firstgid < current) return current;
    return firstgid;
  }, 0);
};

export const createTiledMap = (map: ITiledMap): GameTiledMap => {
  const { height, width } = map;

  if (!isNumber(height) || !isNumber(width)) {
    throw new Error(`Map does not have a width or height`);
  }

  const globalTiles = getGlobalTiles(map);

  const tiles = globalTiles.map((gid, index) => {
    const offset = getTileOffset(map, gid);

    return {
      id: gid - offset,
      x: index % width,
      y: Math.floor(index / width)
    };
  });

  return {
    height: height,
    width: width,
    tiles,

    getTileAt({ x, y }) {
      const idx = y * width + x;
      return tiles[idx];
    }
  };
};
