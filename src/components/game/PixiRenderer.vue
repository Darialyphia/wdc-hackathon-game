<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { CELL_SIZE } from '../../sdk/constants';
import { Container } from 'pixi.js';

const { state } = useGame();
const app = useApplication();

const { setFxContainer, setScreenMapContext } = useFXSequencer();
const initFxContainer = (c: Container) => {
  setFxContainer(c);
};
const screenMap = useScreenMap();
setScreenMapContext(screenMap);

const viewport = ref<Viewport>();

const rotatedEntities = computed(() => {
  return state.value.entities.map(entity => {
    return {
      entity,
      position: screenMap.getRotatedPosition(entity.position)
    };
  });
});

until(viewport)
  .not.toBe(undefined)
  .then(() => {
    viewport.value
      ?.drag({
        mouseButtons: 'right'
      })
      .pinch()
      .wheel({ smooth: 3, percent: 0.05 })
      .zoomPercent(1, false)
      .moveCenter(100, 180);
  });
</script>

<template>
  <viewport
    ref="viewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="state.map.width * CELL_SIZE"
    :world-height="state.map.height * CELL_SIZE"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
  >
    <container :ref="initFxContainer" :sortable-children="true">
      <GameMap />

      <IsoPositioner
        v-for="entity in rotatedEntities"
        :key="entity.entity.id"
        :x="entity.position.x"
        :y="entity.position.y"
        :z="1"
      >
        <GameEntity :entity="entity.entity" />
      </IsoPositioner>

      <SummonPreview />
    </container>
  </viewport>
</template>
