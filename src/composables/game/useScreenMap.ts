import type { InjectionKey } from 'vue';
import type { Game } from './useGame';
import type { Point } from '../../utils/geometry';
import type { ScreenMapContext } from '../../sdk/events';

export const SCREEN_MAP_INJECTION_KEY = Symbol(
  'screen map'
) as InjectionKey<ScreenMapContext>;

export const useScreenMapProvider = (game: Game) => {
  const { state, rotation } = game;

  const rotatedCells = computed(() => {
    const rows = state.value.map.rows.map(row =>
      row.map(cell => ({
        tileId: state.value.map.getTileAt(cell).id,
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

    outer: for (let y = 0; y < state.value.map.height; y++) {
      for (let x = 0; x < state.value.map.width; x++) {
        const cell = rotatedCells.value[y * state.value.map.width + x];

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
    getRotatedPosition
  });

  return { rotatedCells, getRotatedPosition };
};

export const useScreenMap = () => useSafeInject(SCREEN_MAP_INJECTION_KEY);
