<script setup lang="ts">
import type { Texture } from 'pixi.js';
import type { GameMapCell } from '../../sdk/map';
import { CELL_SIZE } from '../../sdk/constants';

const { cell } = defineProps<{
  cell: GameMapCell;
}>();

const { hoveredCell } = useGame();
const { resolveFx } = useAssets();

const hoveredCellTextures = createSpritesheetFrameObject(
  'idle',
  resolveFx('hoveredCell')
) as unknown as Texture[];
</script>

<template>
  <animated-sprite
    v-if="hoveredCell === cell && hoveredCellTextures"
    :x="CELL_SIZE / 2"
    :y="CELL_SIZE / 2"
    :event-mode="'none'"
    :anchor="0.5"
    playing
    :textures="hoveredCellTextures"
  />
</template>
