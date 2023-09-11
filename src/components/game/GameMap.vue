<script setup lang="ts">
import { CELL_SIZE } from '../../game-logic/constants';

const { state } = useGame();
</script>

<template>
  <container>
    <template v-for="row in state.map.rows">
      <graphics
        v-for="cell in row"
        :key="`${cell.x}:${cell.y}`"
        :x="cell.x * CELL_SIZE"
        :y="cell.y * CELL_SIZE"
        @render="
          graphics => {
            graphics.clear();

            graphics.beginFill('yellow', 0.25);
            graphics.lineStyle({
              color: 'yellow',
              width: 1
            });
            graphics.drawRect(0, 0, CELL_SIZE, CELL_SIZE);

            graphics.endFill();
          }
        "
      />
    </template>
  </container>
</template>
