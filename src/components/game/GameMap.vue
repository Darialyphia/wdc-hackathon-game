<script setup lang="ts">
import type { Spritesheet } from 'pixi.js';
import { CELL_SIZE } from '../../game-logic/constants';

const { spritesheet } = defineProps<{
  spritesheet: Spritesheet;
}>();

const textures = computed(() => Object.values(spritesheet.textures));
const { state } = useGame();
</script>

<template>
  <container>
    <template v-for="row in state.map.rows">
      <sprite
        v-for="cell in row"
        :key="`${cell.x}:${cell.y}`"
        :x="cell.x * CELL_SIZE"
        :y="cell.y * CELL_SIZE"
        :texture="textures[10]"
      >
        <graphics
          @render="
            g => {
              g.lineStyle({
                color: 'black',
                alpha: 0.25,
                width: 1
              });
              g.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
            }
          "
        />
      </sprite>
    </template>
  </container>
</template>
