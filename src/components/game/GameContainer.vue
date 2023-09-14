<script lang="ts" setup>
import { Viewport } from 'pixi-viewport';
import { useApplication } from 'vue3-pixi';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { CELL_SIZE } from '../../game-logic/constants';
import type { GameMapCell } from '../../game-logic/map';
import { createPlayerAbility } from '../../game-logic/abilities/player.ability';
import { subject } from '@casl/ability';
import type { Texture } from 'pixi.js';

const { game, state, selectedSummon, activeEntity, targetMode, hoveredCell } = useGame();
const app = useApplication();

const PADDING = 20;

const { fxContainer } = useFXSequencer();
const viewport = ref<Viewport>();

const canSummonAt = (cell: GameMapCell) => {
  const ability = createPlayerAbility(state.value, activeEntity.value.owner);
  return ability.can('summon_at', subject('position', cell));
};

const isSummonPreviewDisplayed = computed(
  () =>
    targetMode.value === 'summon' && hoveredCell.value && canSummonAt(hoveredCell.value)
);

const { resolveSprite } = useAssets();
const summonPreviewTextures = computed(
  () =>
    selectedSummon.value &&
    createSpritesheetFrameObject('idle', resolveSprite(selectedSummon.value?.spriteId))
);

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
      .wheel()
      .zoomPercent(1.01, false)
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

    <animated-sprite
      v-if="hoveredCell && isSummonPreviewDisplayed && summonPreviewTextures"
      :x="hoveredCell.x * CELL_SIZE + CELL_SIZE / 2"
      :y="hoveredCell.y * CELL_SIZE + CELL_SIZE / 2"
      :event-mode="'none'"
      :textures="summonPreviewTextures as unknown as Texture[]"
      :scale-x="activeEntity.owner === game.players[0].userId ? 1 : -1"
      :anchor="0.5"
      :playing="false"
      :filters="summonPreviewFilters"
    />
  </viewport>
</template>
