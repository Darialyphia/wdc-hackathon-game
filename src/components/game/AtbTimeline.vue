<script setup lang="ts">
const { state, selectedEntity, atbTimeline, rotation } = useGame();

const rotateCw = () => {
  rotation.value = ((rotation.value + 90) % 360) as any;
};
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

    <UiIconButton
      icon="mdi-horizontal-rotate-clockwise"
      title="rotate map"
      :theme="{ size: 'font-size-5' }"
      @click="rotateCw"
    />
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
  button:not(.ui-icon-button) {
    all: initial;

    aspect-ratio: 1;
    width: 48px;
    padding: 0;

    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.5),
      transparent 65%
    );

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

.ui-icon-button {
  transform: rotateZ(90deg);
}
</style>
