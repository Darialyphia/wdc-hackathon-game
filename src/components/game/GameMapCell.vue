<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Texture, Cursor } from 'pixi.js';
import { getCellAt } from '../../sdk/utils/map.helpers';
import { getEntityAt } from '../../sdk/utils/entity.helpers';
import type { GameMapCell } from '../../sdk/map';
import { CELL_SIZE } from '../../sdk/constants';
import { Polygon } from 'pixi.js';

const { x, y, texture } = defineProps<{
  texture: Texture;
  x: number;
  y: number;
}>();

const {
  state,
  activeEntity,
  isMyTurn,
  canSummonAt,
  canMoveTo,
  pathfinder,
  targetMode,
  hoveredCell,
  rotation
} = useGame();
const app = useApplication();
const cell = computed(() => getCellAt(state.value, { x, y }));

const isValidSummonTarget = computed(() => {
  if (!cell.value) return;

  return canSummonAt(cell.value);
});

const isValidMoveTarget = (cell: GameMapCell) => {
  if (!cell) return false;
  const entity = getEntityAt(state.value, cell);

  if (!canMoveTo(cell)) return false;

  return (
    !entity || entity === activeEntity.value || entity.owner === activeEntity.value.owner
  );
};

const pathFilter = new ColorOverlayFilter(0x7777ff, 0.5);

const isMovePathHighlighted = computed(() => {
  if (!cell.value) return false;
  if (!hoveredCell.value) return false;
  if (!isMyTurn.value) return false;
  if (targetMode.value !== 'move') return false;

  const hasAlly =
    getEntityAt(state.value, cell.value)?.owner === activeEntity.value.owner;
  if (!isValidMoveTarget(cell.value) && !hasAlly) return false;

  const path = pathfinder.value.findPath(
    {
      x: Math.round(activeEntity.value.position.x),
      y: Math.round(activeEntity.value.position.y)
    },
    hoveredCell.value
  );
  const isInPath = path.some(
    ([pathX, pathY], index) =>
      x === pathX &&
      y === pathY &&
      index <= activeEntity.value.speed - activeEntity.value.movedAmount
  );

  const isActiveEntityPosition =
    x === activeEntity.value.position.x && y === activeEntity.value.position.y;

  return isInPath || isActiveEntityPosition;
});

const cursor = computed(() => {
  if (cell.value && targetMode.value === 'move' && isValidMoveTarget(cell.value)) {
    return app.value.renderer.events.cursorStyles.move as Cursor;
  }
  if (targetMode.value === 'summon' && isValidSummonTarget.value) {
    return app.value.renderer.events.cursorStyles.summon as Cursor;
  }
  return undefined;
});

const hitArea = new Polygon([
  { x: CELL_SIZE / 2, y: 0 },
  { x: CELL_SIZE, y: CELL_SIZE / 4 },
  { x: CELL_SIZE, y: CELL_SIZE * 0.75 },
  { x: CELL_SIZE / 2, y: CELL_SIZE },
  { x: 0, y: CELL_SIZE * 0.75 },
  { x: 0, y: CELL_SIZE / 4 }
]);
</script>

<template>
  <container
    :filters="isMovePathHighlighted ? [pathFilter] : []"
    :hit-area="hitArea"
    :cursor="cursor"
    @pointerenter="hoveredCell = cell"
    @pointerleave="hoveredCell = null"
  >
    <sprite
      :texture="texture"
      :scale-x="rotation === 90 || rotation === 270 ? -1 : 1"
      :cursor="cursor"
    >
      <HoveredCell v-if="cell" :cell="cell" :cursor="cursor" />
    </sprite>

    <container :pivot-x="rotation % 180 === 90 ? CELL_SIZE : 0">
      <GameMapCellHighlight v-if="cell" :cell="cell" :cursor="cursor" />
    </container>
  </container>
</template>
