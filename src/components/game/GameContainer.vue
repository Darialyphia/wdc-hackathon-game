<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { CELL_SIZE } from '../../game-logic/constants';
const { state } = useGame();

const app = useApplication();
const PADDING = 20;
</script>

<template>
  <viewport
    :screen-width="app.view.width"
    :height="app.view.height"
    :world-width="state.map.width * CELL_SIZE + PADDING"
    :world-height="state.map.height * CELL_SIZE + PADDING"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    @render="
      (viewport: Viewport) => {
        viewport
          .drag({
            mouseButtons: 'right'
          })
          .pinch()
          .wheel();
      }
    "
  >
    <GameMap />
  </viewport>
</template>
