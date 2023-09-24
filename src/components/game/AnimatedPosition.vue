<script setup lang="ts">
import gsap from 'gsap';
import type { Point } from '../../utils/geometry';
import { CELL_SIZE } from '../../sdk/constants';

const props = defineProps<{
  x: number;
  y: number;
  axis: Point;
  z: number;
  debug?: boolean;
}>();

const { isPlaying } = useFXSequencer();
const tweened = ref({ x: props.x, y: props.y });

watch(
  () => ({ x: props.x, y: props.y }),
  newPos => {
    if (isPlaying) {
      tweened.value = { x: props.x, y: props.y };
      return;
    }

    gsap.to(tweened.value, {
      duration: 0.5,
      ...newPos
    });
  }
);

const tileWidth = CELL_SIZE;
const tileHeight = tileWidth / 2;

const cartesian = computed(() => ({
  x: tweened.value.x / (tileWidth / 2),
  y: (tweened.value.y / (tileHeight / 2)) * 2
}));

const zIndex = computed(() => {
  const cartesian = {
    x: tweened.value.x / (tileWidth / 2),
    y: (tweened.value.y / (tileHeight / 2)) * 2
  };

  return cartesian.x + cartesian.y + props.z;
});

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <container :ref="autoDestroyRef" :x="tweened.x" :y="tweened.y" :z-index="zIndex">
    <slot />
  </container>
  <text
    v-if="props.debug"
    :ref="autoDestroyRef"
    :style="{ fontSize: 20, fill: 'white' }"
    :scale="0.5"
    :z-index="1000"
    :x="tweened.x"
    :anchor="0.5"
    :y="tweened.y - tileHeight / 2"
  >
    {{ zIndex }}\n{{ cartesian.x }}:{{ cartesian.y }}
  </text>
</template>
