import type { ITiledMap } from '@workadventure/tiled-map-type-guard';
import type { GameMapCell } from '../../sdk/map';
import type { InjectionKey, ComputedRef } from 'vue';
import type { GameTiledMap } from '../../utils/tiled';
import type { Game } from './useGame';
import type { Entity } from '../../sdk/entity';
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
  getEntityRotatedPosition(entity: Entity): Point;
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

  const getEntityRotatedPosition = (entity: Entity) => {
    let pos = { x: 0, y: 0 };

    outer: for (let y = 0; y < tiledMap.height; y++) {
      for (let x = 0; x < tiledMap.width; x++) {
        const cell = rotatedCells.value[y * tiledMap.width + x];

        if (
          cell.gameCell.x === entity.position.x &&
          cell.gameCell.y === entity.position.y
        ) {
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
    getEntityRotatedPosition
  });

  return { rotatedCells, map: tiledMap, getEntityRotatedPosition };
};

export const useScreenMap = () => useSafeInject(SCREEN_MAP_INJECTION_KEY);
