<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { CELL_SIZE } from '../../game-logic/constants';
import { Assets, Spritesheet } from 'pixi.js';
import { ASSET_BUNDLES } from '../../assets/manifest';

const { state } = useGame();
const app = useApplication();

const PADDING = 20;

const spritesheet = ref<Spritesheet>();

onMounted(async () => {
  const [tilesets] = await Promise.all([
    Assets.loadBundle(ASSET_BUNDLES.TILESETS)
    // Assets.loadBundle(ASSET_BUNDLES.SPRITES),
    // Assets.loadBundle(ASSET_BUNDLES.PREFABS)
  ]);

  spritesheet.value = tilesets.base;
});
</script>

<template>
  <viewport
    v-if="spritesheet"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
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
          .wheel()
          .zoomPercent(1, false)
          .moveCenter(
            (state.map.width * CELL_SIZE + PADDING) / 2,
            (state.map.height * CELL_SIZE + PADDING) / 2
          );
      }
    "
  >
    <GameMap :spritesheet="spritesheet" />
  </viewport>
</template>
