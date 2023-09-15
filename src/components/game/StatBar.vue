<script setup lang="ts">
import { CELL_SIZE } from '../../game-logic/constants';
import { fill } from 'lodash-es';
import type { ColorSource } from 'pixi.js';

const { value, maxValue, filledColor, emptyColor, size } = defineProps<{
  value: number;
  maxValue: number;
  filledColor: ColorSource;
  emptyColor?: ColorSource;
  size: number;
}>();

const animatedValue = ref(value);

watch(
  () => value,
  newValue => {
    gsap.to(animatedValue, {
      duration: 0.3,
      ease: Power2.easeOut,
      delay: 0,

      value: newValue
    });
  }
);
</script>

<template>
  <graphics
    @render="
      g => {
        g.clear();

        if (emptyColor) {
          g.beginFill(emptyColor);
          g.drawRect(0, 0, CELL_SIZE, size);
        }
        g.beginFill(filledColor);
        g.drawRect(0, 0, (animatedValue * CELL_SIZE) / maxValue, size);
        g.endFill();

        g.lineStyle({
          width: 0.5,
          color: 'black',
          alpha: 1
        });
        g.drawRect(0, 0, CELL_SIZE, size);
      }
    "
  />
</template>
