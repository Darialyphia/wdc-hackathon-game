<script setup lang="ts">
import type { Entity } from '../../game-logic/entity';
import { CELL_SIZE } from '../../game-logic/constants';

const { entity } = defineProps<{
  entity: Entity;
}>();
</script>

<template>
  <graphics
    :x="0"
    :y="0"
    @render="
      g => {
        g.clear();
        g.beginFill('red');
        g.drawCircle(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2);
        g.endFill();
      }
    "
  ></graphics>
</template>
