<script setup lang="ts">
import type { Spritesheet } from 'pixi.js';

const { spritesheet } = defineProps<{
  spritesheet: Spritesheet;
}>();

const textures = computed(() => Object.values(spritesheet.textures));
const { state } = useGame();
</script>

<template>
  <container>
    <template v-for="row in state.map.rows">
      <GameMapCell
        v-for="cell in row"
        :key="`${cell.x}:${cell.y}`"
        :cell="cell"
        :texture="textures[10]"
      />
    </template>
  </container>
</template>
