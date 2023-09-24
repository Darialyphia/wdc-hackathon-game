<script setup lang="ts">
import { CELL_SIZE } from '../../sdk/constants';
import hardcodedmap from '../../assets/maps/iso/iso.json';
import { createTiledMap } from '../../utils/tiled';
import type { ITiledMap } from '@workadventure/tiled-map-type-guard';
import type { Point } from '../../utils/geometry';
import { getCellAt } from '../../sdk/utils/map.helpers';

const { resolveTileset } = useAssets();
const textures = computed(() => Object.values(resolveTileset('iso').textures));

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

const TILE_WIDTH = CELL_SIZE;
const TILE_HEIGHT = TILE_WIDTH / 2;

const isoTiles = computed(() =>
  tiledMap.tiles.map(tile => {
    const x = tile.x + offset.value.x;
    const y = tile.y + offset.value.y;
    console.log(x, y);
    return {
      ...tile,
      isoX: (x - y) * (TILE_WIDTH / 2),
      isoY: (x + y) * (TILE_HEIGHT / 2),
      isoZ: 0
    };
  })
);
</script>

<template>
  <AnimatedPosition
    v-for="tile in isoTiles"
    :key="`${tile.x}:${tile.y}`"
    :x="tile.isoX"
    :y="tile.isoY"
    :z="tile.isoZ"
    :axis="{
      x: (state.map.width * CELL_SIZE) / 2,
      y: (state.map.height * CELL_SIZE) / 2
    }"
  >
    <GameMapCell
      :x="tile.x + offset.x"
      :y="tile.y + offset.y"
      :texture="textures[tile.id]"
      @pointerup="onPointerup({ x: tile.x + offset.x, y: tile.y + offset.y })"
    />
  </AnimatedPosition>
</template>
