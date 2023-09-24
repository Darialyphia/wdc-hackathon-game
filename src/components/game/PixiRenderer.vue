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

const { setFxContainer } = useFXSequencer();
const initFxContainer = (c: Container) => {
  setFxContainer(c);
};
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
const hoveredCellTextures = createSpritesheetFrameObject(
  'idle',
  resolveFx('hoveredCell')
) as unknown as Texture[];

const summonPreviewFilters = [
  new AdjustmentFilter({
    brightness: 2,
    alpha: 0.3
  })
];

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

      <!-- <IsoPositioner
      v-if="hoveredCell && hoveredCellTextures"
      :x="hoveredCell.x"
      :y="hoveredCell.y"
      :z="0"
      :event-mode="'none'"
    >
      <animated-sprite
        v-if="hoveredCell && hoveredCellTextures"
        :x="CELL_SIZE / 2"
        :y="CELL_SIZE / 2"
        :event-mode="'none'"
        :anchor="0.5"
        playing
        :textures="hoveredCellTextures"
      />
    </IsoPositioner> -->

      <IsoPositioner
        v-for="entity in state.entities"
        :key="entity.id"
        :x="entity.position.x"
        :y="entity.position.y"
        :z="1"
      >
        <GameEntity :entity="entity" />
      </IsoPositioner>

      <!--
    <animated-sprite
      v-if="hoveredCell && isSummonPreviewDisplayed && summonPreviewTextures"
      :x="hoveredCell.x * CELL_SIZE + CELL_SIZE / 2"
      :y="hoveredCell.y * CELL_SIZE + CELL_SIZE / 2"
      :event-mode="'none'"
      :textures="summonPreviewTextures"
      :scale-x="activeEntity.owner === game.players[0].userId ? 1 : -1"
      :anchor="0.5"
      :playing="false"
      :filters="summonPreviewFilters"
    /> -->
    </container>
  </viewport>
</template>
