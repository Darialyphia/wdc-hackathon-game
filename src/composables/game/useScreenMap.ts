import type { ITiledMap } from '@workadventure/tiled-map-type-guard';
import type { GameMapCell } from '../../sdk/map';
import type { InjectionKey, ComputedRef } from 'vue';
import type { GameTiledMap } from '../../utils/tiled';
import type { Game } from './useGame';
import type { Point } from '../../utils/geometry';

export type ScreenMapContext = {
  map: GameTiledMap;
  rotatedCells: ComputedRef<
    {
      gameCell: GameMapCell;
      tileId: number;
      screenX: number;
      screenY: number;
    }[]
  >;
  getRotatedPosition(point: Point): Point;
};

export const SCREEN_MAP_INJECTION_KEY = Symbol(
  'screen map'
) as InjectionKey<ScreenMapContext>;

export const useScreenMapProvider = (map: ITiledMap, game: Game) => {
  const { state, rotation } = game;
  const tiledMap = createTiledMap(map as ITiledMap);
  const rotatedCells = computed(() => {
    const rows = state.value.map.rows.map(row =>
      row.map(cell => ({
        tileId: tiledMap.getTileAt(cell).id,
        gameCell: cell
      }))
    );

    return rotate(rows, rotation.value)
      .flatMap((row, y) =>
        row.map((cell, x) => ({
          ...cell,
          screenX: x,
          screenY: y
        }))
      )
      .sort((a, b) => a.gameCell.id - b.gameCell.id);
  });

  const getRotatedPosition = (point: Point) => {
    let pos = { x: 0, y: 0 };

    outer: for (let y = 0; y < tiledMap.height; y++) {
      for (let x = 0; x < tiledMap.width; x++) {
        const cell = rotatedCells.value[y * tiledMap.width + x];

        if (cell.gameCell.x === point.x && cell.gameCell.y === point.y) {
          pos = { x: cell.screenX, y: cell.screenY };
          break outer;
        }
      }
    }

    return pos;
  };

  provide(SCREEN_MAP_INJECTION_KEY, {
    rotatedCells,
    map: tiledMap,
    getRotatedPosition
  });

  return { rotatedCells, map: tiledMap, getRotatedPosition };
};

export const useScreenMap = () => useSafeInject(SCREEN_MAP_INJECTION_KEY);
