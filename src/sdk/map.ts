import {
  ITiledMapTileLayer,
  ITiledMapTileset,
  ITiledMap,
  ITiledMapTile
} from '@workadventure/tiled-map-type-guard';
import type { Point } from '../utils/geometry';
import { isDefined, isNumber } from '../utils/assertions';
import type { MapData, MapId } from './maps';

export type GameMapCell = Point & {
  isWalkable: boolean;
  id: number;
  tile: number;
};

export type GameMap = GameTiledMap & {
  id: MapId;
  raw: { map: ITiledMap; tileset: ITiledMapTileset };
};
export type SerializedMap = { map: ITiledMap; tileset: ITiledMapTileset };

export type GameTiledMap = {
  width: number;
  height: number;
  tiles: GameMapCell[];
  rows: GameMapCell[][];
  getTileAt: (coords: Point) => GameMapCell;
};

const getTileProperty = <T>(
  tile: ITiledMapTile | undefined,
  propName: string,
  defaultValue: T
): T => {
  if (!tile) return defaultValue;

  const prop = tile.properties?.find(prop => prop.name === propName);

  return prop ? (prop.value as T) : defaultValue;
};

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

export const createTiledMap = (
  map: ITiledMap,
  tileset: ITiledMapTileset
): GameTiledMap => {
  const { height, width } = map;

  if (!isNumber(height) || !isNumber(width)) {
    throw new Error(`Map does not have a width or height`);
  }

  if (!('tiles' in tileset) || !isDefined(tileset.tiles)) {
    throw new Error(`Tileset has no tiles !`);
  }

  const globalTiles = getGlobalTiles(map);

  let nextId = 1;

  const tiles = globalTiles.map((gid, index) => {
    const offset = getTileOffset(map, gid);
    const tile = tileset.tiles?.find(tile => tile.id === gid - offset);

    return {
      id: nextId++,
      isWalkable: getTileProperty(tile, 'walkable', false),
      tile: gid - offset,
      x: index % width,
      y: Math.floor(index / width)
    };
  });

  return {
    height,
    width,
    tiles,
    rows: Array.from({ length: height }, (_, y): GameMapCell[] =>
      Array.from({ length: width }, (_, x) => tiles[y * width + x])
    ),
    getTileAt({ x, y }) {
      const idx = y * (width as number) + x;
      return tiles[idx];
    }
  };
};

export const createGameMap = ({ layout, id, tileset }: MapData): GameMap => {
  const map = createTiledMap(layout, tileset);

  return {
    ...map,
    id,
    raw: { map: layout, tileset }
  };
};

export const serializeMap = (map: GameMap) => map.raw;
export const deserializeMap = createGameMap;
