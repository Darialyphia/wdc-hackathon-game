<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { CELL_SIZE } from '../../sdk/constants';
import type { GameMapCell } from '../../sdk/map';
import { createPlayerAbility } from '../../sdk/abilities/player.ability';
import { subject } from '@casl/ability';
import { type Texture } from 'pixi.js';

const { game, state, selectedSummon, activeEntity, targetMode, hoveredCell } = useGame();
const app = useApplication();

const { fxContainer } = useFXSequencer();
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

const isoEntities = computed(() =>
  state.value.entities.map(entity => {
    const x = entity.position.x;
    const y = entity.position.y;
    console.log('entity', x, y);
    return {
      entity,
      isoX: (x - y) * (CELL_SIZE / 2),
      isoY: (x + y) * (CELL_SIZE / 4),
      isoZ: CELL_SIZE / 2
    };
  })
);

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
    @render="
      (viewport: Viewport) => {
        viewport.addChild(fxContainer);
        viewport.sortableChildren = true;
      }
    "
  >
    <GameMap />

    <!-- <animated-sprite
      v-if="hoveredCell && hoveredCellTextures"
      :x="hoveredCell.x * CELL_SIZE + CELL_SIZE / 2"
      :y="hoveredCell.y * CELL_SIZE + CELL_SIZE / 2"
      :event-mode="'none'"
      :anchor="0.5"
      :alpha="0.5"
      playing
      :textures="hoveredCellTextures"
    /> -->

    <AnimatedPosition
      v-for="entity in isoEntities"
      :key="entity.entity.id"
      :x="entity.isoX"
      :y="entity.isoY"
      :z="entity.isoZ"
      :axis="{
        x: (state.map.width * CELL_SIZE) / 2,
        y: (state.map.height * CELL_SIZE) / 2
      }"
    >
      <GameEntity :entity="entity.entity" :x="CELL_SIZE / 2" />
    </AnimatedPosition>

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
  </viewport>
</template>
