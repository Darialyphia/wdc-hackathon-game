<script setup lang="ts">
import { CELL_SIZE } from '../../sdk/constants';
import { toIso } from '../../sdk/utils/iso';

const { x, y, z } = defineProps<{
  x: number;
  y: number;
  z: number;
}>();

const position = computed(() => toIso({ x, y, z }));

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
