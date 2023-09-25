<script lang="ts" setup>
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { CELL_SIZE } from '../../sdk/constants';
import type { GameMapCell } from '../../sdk/map';
import { createPlayerAbility } from '../../sdk/abilities/player.ability';
import { subject } from '@casl/ability';
import type { Texture } from 'pixi.js';

const { game, state, selectedSummon, activeEntity, targetMode, hoveredCell, rotation } =
  useGame();

const screenMap = useScreenMap();

const canSummonAt = ({ x, y }: GameMapCell) => {
  const ability = createPlayerAbility(state.value, activeEntity.value.owner);
  return ability.can('summon_at', subject('position', { x, y }));
};

const isSummonPreviewDisplayed = computed(
  () =>
    targetMode.value === 'summon' && hoveredCell.value && canSummonAt(hoveredCell.value)
);

const { resolveSprite } = useAssets();
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

const scaleX = computed(() => {
  if (rotation.value === 90 || rotation.value === 180) {
    return activeEntity.value.owner === game.value.players[0].userId ? -1 : 1;
  }

  return activeEntity.value.owner === game.value.players[0].userId ? 1 : -1;
});
</script>

<template>
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
      :scale-x="scaleX"
      :anchor="0.5"
      :playing="false"
      :filters="summonPreviewFilters"
    />
  </IsoPositioner>
</template>
