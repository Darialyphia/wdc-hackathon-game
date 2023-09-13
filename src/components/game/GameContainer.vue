<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { CELL_SIZE } from '../../game-logic/constants';
import { Assets, Spritesheet } from 'pixi.js';
import { ASSET_BUNDLES } from '../../assets/manifest';

const { state } = useGame();
const app = useApplication();

const PADDING = 20;

const { isReady } = useAssetsProvider();

const vp = ref<Viewport>();
until(vp)
  .not.toBe(undefined)
  .then(() => {
    vp.value
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
    v-if="isReady"
    ref="vp"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="state.map.width * CELL_SIZE + PADDING"
    :world-height="state.map.height * CELL_SIZE + PADDING"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
  >
    <container :sortable-children="true">
      <GameMap />

      <GameEntity v-for="entity in state.entities" :key="entity.id" :entity="entity" />
    </container>
  </viewport>
</template>
