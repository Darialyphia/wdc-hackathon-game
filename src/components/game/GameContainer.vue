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

    <graphics
      v-for="entity in state.entities"
      :key="entity.id"
      :x="entity.position.x * CELL_SIZE"
      :y="entity.position.y * CELL_SIZE"
      @render="
        g => {
          g.clear();
          g.beginFill('red');
          g.drawCircle(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2);
          g.endFill();
        }
      "
    />
  </viewport>
</template>
