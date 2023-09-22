<script setup lang="ts">
const { state, selectedEntity, atbTimeline } = useGame();
</script>

<template>
  <div class="timeline fancy-surface">
    <div>
      <div class="global-atb" :style="{ '--percent': state.globalAtb }" />
      Turn&nbsp;{{ state.turn }}
    </div>
    <button
      v-for="(entity, index) in atbTimeline"
      :key="index"
      style="appearance: none"
      @mouseenter="selectedEntity = entity"
      @mouseleave="selectedEntity = null"
    >
      <img :src="entity.blueprint.iconUrl" />
    </button>
  </div>
</template>

<style scoped>
.timeline {
  position: absolute;
  top: var(--size-4);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding-inline: var(--size-2);

  background-color: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
  button {
    all: initial;

    aspect-ratio: 1;
    width: 32px;
    padding: 0;

    image-rendering: pixelated;
    &:hover {
      filter: brightness(130%);
    }

    &:first-of-type {
      width: 64px;
    }
  }
}
.global-atb {
  aspect-ratio: 1;
  width: var(--size-7);
  margin-inline: auto;

  background: conic-gradient(
    var(--blue-7) 0deg,
    var(--blue-7) calc(1deg * var(--percent)),
    black calc(1deg * var(--percent))
  );
  background-repeat: no-repeat;
  border: solid var(--border-size-1) var(--primary);
  border-radius: var(--radius-round);
}
</style>
