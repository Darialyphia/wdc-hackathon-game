import type { ITiledMap, ITiledMapTileset } from '@workadventure/tiled-map-type-guard';
import map1 from '../../assets/maps/iso/iso.json';
import tileset1 from '../../assets/maps/iso/tileset.json';

export type MapId = string;

export type MapData = {
  id: MapId;
  layout: ITiledMap;
  tileset: ITiledMapTileset;
};

export const mapsLookup = {
  map1: {
    id: 'map1',
    layout: map1 as ITiledMap,
    tileset: tileset1 as ITiledMapTileset
  }
} as const satisfies Record<MapId, MapData>;
