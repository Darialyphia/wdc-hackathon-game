<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { CELL_SIZE } from '../../sdk/constants';
import type { GameMapCell } from '../../sdk/map';
import { createPlayerAbility } from '../../sdk/abilities/player.ability';
import { subject } from '@casl/ability';
import { Container, type Texture } from 'pixi.js';

const { game, state, selectedSummon, activeEntity, targetMode, hoveredCell } = useGame();
const app = useApplication();

const { setFxContainer, setScreenMapContext } = useFXSequencer();
const initFxContainer = (c: Container) => {
  setFxContainer(c);
};
const screenMap = useScreenMap();
setScreenMapContext(screenMap);

const viewport = ref<Viewport>();

const canSummonAt = ({ x, y }: GameMapCell) => {
  const ability = createPlayerAbility(state.value, activeEntity.value.owner);
  return ability.can('summon_at', subject('position', { x, y }));
};

const isSummonPreviewDisplayed = computed(
  () =>
    targetMode.value === 'summon' && hoveredCell.value && canSummonAt(hoveredCell.value)
);

const { resolveSprite, resolveFx } = useAssets();
const summonPreviewTextures = computed(
  () =>
    selectedSummon.value &&
    (createSpritesheetFrameObject(
      'idle',
      resolveSprite(selectedSummon.value?.characterId)
    ) as unknown as Texture[])
);

const summonPreviewFilters = [
  new AdjustmentFilter({
    brightness: 2,
    alpha: 0.3
  })
];

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

      <IsoPositioner
        v-if="hoveredCell && isSummonPreviewDisplayed && summonPreviewTextures"
        v-bind="screenMap.getRotatedPosition(hoveredCell)"
        :z="1"
        :speed="0"
      >
        <animated-sprite
          v-if="hoveredCell && isSummonPreviewDisplayed && summonPreviewTextures"
          :x="CELL_SIZE / 2"
          :event-mode="'none'"
          :textures="summonPreviewTextures"
          :scale-x="activeEntity.owner === game.players[0].userId ? 1 : -1"
          :anchor="0.5"
          :playing="false"
          :filters="summonPreviewFilters"
        />
      </IsoPositioner>
    </container>
  </viewport>
</template>
