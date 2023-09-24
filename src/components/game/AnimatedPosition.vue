<script setup lang="ts">
import gsap from 'gsap';

const props = defineProps<{
  x: number;
  y: number;
  axis: { x: number; y: number };
  z: number;
  debug?: boolean;
}>();

type Point = {
  x: number;
  y: number;
};

const tweened = ref({ x: props.x, y: props.y });

watch(
  () => ({ x: props.x, y: props.y }),
  newPos => {
    gsap.to(tweened.value, {
      duration: 0.5,
      ...newPos
    });
  }
);

const tileWidth = 64;
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
</script>

<template>
  <container :x="tweened.x" :y="tweened.y" :z-index="zIndex">
    <slot />
  </container>
  <text
    v-if="props.debug"
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
