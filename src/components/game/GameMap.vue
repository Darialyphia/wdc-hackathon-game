<script setup lang="ts">
import type { GameMapCell } from '../../sdk/map';
import hardcodedmap from '../../assets/maps/map_01/map_01.json';
import { createTiledMap } from '../../utils/tiled';
import type { ITiledMap } from '@workadventure/tiled-map-type-guard';
import type { Point } from '../../utils/geometry';
import { getCellAt } from '../../sdk/utils/map.helpers';

const { resolveTileset } = useAssets();
const textures = computed(() => Object.values(resolveTileset('map_01').textures));

const { state, selectedSummon, selectedSkill, summon, useSkill, move, targetMode } =
  useGame();

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

const tiledMap = createTiledMap(hardcodedmap as ITiledMap);
const offset = computed(() => ({
  x: (state.value.map.width - hardcodedmap.width) / 2,
  y: (state.value.map.height - hardcodedmap.height) / 2
}));
</script>

<template>
  <container>
    <GameMapCell
      v-for="tile in tiledMap.tiles"
      :key="`${tile.x}:${tile.y}`"
      :x="tile.x + offset.x"
      :y="tile.y + offset.y"
      :texture="textures[tile.id]"
      @pointerup="onPointerup({ x: tile.x + offset.x, y: tile.y + offset.y })"
    />
  </container>
</template>
