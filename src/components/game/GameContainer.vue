<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { CELL_SIZE } from '../../game-logic/constants';

const { state } = useGame();
const app = useApplication();

const PADDING = 20;

const { fxContainer } = useFXSequencer();
const viewport = ref<Viewport>();

until(viewport)
  .not.toBe(undefined)
  .then(() => {
    viewport.value
      ?.drag({
        mouseButtons: 'right'
      })
      .pinch()
      .wheel()
      .zoomPercent(1, false)
      .moveCenter(
        (state.value.map.width * CELL_SIZE + PADDING) / 2,
        (state.value.map.height * CELL_SIZE + PADDING) / 2
      );
  });
</script>

<template>
  <viewport
    ref="viewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="state.map.width * CELL_SIZE + PADDING"
    :world-height="state.map.height * CELL_SIZE + PADDING"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    @render="
      (viewport: Viewport) => {
        viewport.addChild(fxContainer);
        viewport.sortableChildren = true;
      }
    "
  >
    <GameMap />

    <GameEntity v-for="entity in state.entities" :key="entity.id" :entity="entity" />
  </viewport>
</template>
