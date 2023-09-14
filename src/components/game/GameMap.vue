<script setup lang="ts">
import type { GameMapCell } from '../../game-logic/map';
import hardcodedmap from '../../assets/maps/map_01/map_01.json';
import { createTiledMap } from '../../utils/tiled';
import type { ITiledMap } from '@workadventure/tiled-map-type-guard';
import type { Point } from '../../utils/geometry';
import { getCellAt } from '../../game-logic/utils/map.helpers';

const { resolveTileset } = useAssets();
const textures = computed(() => Object.values(resolveTileset('map_01').textures));

const { state, selectedSummon, selectedSkill, summon, useSkill, move } = useGame();

const onClick = ({ x, y }: Point) => {
  const cell = getCellAt(state.value, { x, y });
  if (!cell) return;

  if (selectedSummon.value) {
    summon(cell);
  } else if (selectedSkill.value) {
    useSkill(cell);
  } else {
    move(cell);
  }
};

const tiledMap = createTiledMap(hardcodedmap as ITiledMap);
const offset = computed(() => ({
  x: (state.value.map.width - hardcodedmap.width) / 2,
  y: (state.value.map.height - hardcodedmap.height) / 2
}));
console.log(offset.value);
</script>

<template>
  <container>
    <GameMapCell
      v-for="tile in tiledMap.tiles"
      :key="`${tile.x}:${tile.y}`"
      :x="tile.x + offset.x"
      :y="tile.y + offset.y"
      :texture="textures[tile.id]"
      @click="onClick({ x: tile.x + offset.x, y: tile.y + offset.y })"
    />
  </container>
</template>
