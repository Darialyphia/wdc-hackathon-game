<script setup lang="ts">
import { createTiledMap } from '../../utils/tiled';
import type { ITiledMap } from '@workadventure/tiled-map-type-guard';
import type { Point } from '../../utils/geometry';
import { getCellAt } from '../../sdk/utils/map.helpers';

const { resolveTileset } = useAssets();
const textures = computed(() => Object.values(resolveTileset('iso').textures));

const {
  state,
  selectedSummon,
  selectedSkill,
  summon,
  useSkill,
  move,
  targetMode,
  rotation
} = useGame();

const onPointerup = ({ x, y }: Point) => {
  const cell = getCellAt(state.value, { x, y });
  if (!cell) return;

  if (targetMode.value === 'summon' && selectedSummon.value) {
    summon(cell);
  } else if (targetMode.value === 'skill' && selectedSkill.value) {
    useSkill(cell);
  } else if (targetMode.value === 'move') {
    move(cell);
  }
  targetMode.value = null;
};

const { rotatedCells, map } = useScreenMap();
const offset = computed(() => ({
  x: (state.value.map.width - map.width) / 2,
  y: (state.value.map.height - map.height) / 2
}));
</script>

<template>
  <IsoPositioner
    v-for="cell in rotatedCells"
    :key="`${cell.gameCell.id}`"
    :x="cell.screenX"
    :y="cell.screenY"
    :z="0"
  >
    <GameMapCell
      :x="cell.gameCell.x + offset.x"
      :y="cell.gameCell.y + offset.y"
      :texture="textures[cell.tileId]"
      @pointerup="
        onPointerup({ x: cell.gameCell.x + offset.x, y: cell.gameCell.y + offset.y })
      "
    />
  </IsoPositioner>
</template>
