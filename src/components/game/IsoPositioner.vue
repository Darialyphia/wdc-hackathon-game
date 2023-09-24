<script setup lang="ts">
import { CELL_SIZE } from '../../sdk/constants';

const { x, y, z } = defineProps<{
  x: number;
  y: number;
  z: number;
}>();

const TILE_WIDTH = CELL_SIZE;
const TILE_HEIGHT = TILE_WIDTH / 2;

const position = computed(() => ({
  isoX: (x - y) * (TILE_WIDTH / 2),
  isoY: (x + y) * (TILE_HEIGHT / 2),
  isoZ: z * TILE_HEIGHT
}));

const { state } = useGame();
</script>

<template>
  <AnimatedPosition
    :x="position.isoX"
    :y="position.isoY"
    :z="position.isoZ"
    :axis="{
      x: (state.map.width * CELL_SIZE) / 2,
      y: (state.map.height * CELL_SIZE) / 2
    }"
  >
    <slot />
  </AnimatedPosition>
</template>
