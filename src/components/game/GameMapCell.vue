<script setup lang="ts">
import { CELL_SIZE } from '../../game-logic/constants';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { ColorGradientFilter } from '@pixi/filter-color-gradient';
import type { Texture } from 'pixi.js';
import { subject } from '@casl/ability';
import { createPlayerAbility } from '../../game-logic/abilities/player.ability';
import { getCellAt } from '../../game-logic/utils/map.helpers';

const { x, y, texture } = defineProps<{
  texture: Texture;
  x: number;
  y: number;
}>();

const {
  state,
  activeEntity,
  isMyTurn,
  selectedSkill,
  pathfinder,
  targetMode,
  hoveredCell
} = useGame();

const cell = computed(() => getCellAt(state.value, { x, y }));
const canSummonAt = computed(() => {
  if (!cell.value) return;

  const ability = createPlayerAbility(state.value, activeEntity.value.owner);
  return ability.can('summon_at', subject('position', cell.value));
});

const isInCastRange = computed(() => {
  if (!selectedSkill.value) return;
  if (!cell.value) return;

  return (
    Math.abs(cell.value.x - activeEntity.value.position.x) <= selectedSkill.value.range &&
    Math.abs(cell.value.y - activeEntity.value.position.y) <= selectedSkill.value.range
  );
});

const canMoveTo = computed(() => {
  if (!cell.value) return;

  const path = pathfinder.value.findPath(
    {
      x: Math.round(activeEntity.value.position.x),
      y: Math.round(activeEntity.value.position.y)
    },
    cell.value
  );

  return path.length > 0 && path.length <= activeEntity.value.ap;
});

const isHighlighted = computed(() => {
  if (!isMyTurn.value) return;
  if (targetMode.value === 'summon') return canSummonAt.value;
  if (targetMode.value === 'skill') return isInCastRange.value;

  return targetMode.value === 'move' && canMoveTo.value;
});

const targetableFilter = new AdjustmentFilter({ gamma: 1.5, contrast: 1.3 });
const hoverFilter = new ColorGradientFilter({
  type: ColorGradientFilter.RADIAL,
  stops: [
    { offset: 0.0, color: 'white', alpha: 0 },
    { offset: 0.5, color: 'white', alpha: 0 },
    { offset: 1.0, color: 'white', alpha: 0.3 }
  ]
});

const filters = computed(() => {
  const _filters = [];
  if (isHighlighted.value) _filters.push(targetableFilter);
  if (hoveredCell.value === cell.value) _filters.push(hoverFilter);
  return _filters;
});
</script>

<template>
  <sprite
    :key="`${x}:${y}`"
    :x="x * CELL_SIZE"
    :y="y * CELL_SIZE"
    :texture="texture"
    :filters="filters"
    @pointerenter="hoveredCell = cell"
    @pointerleave="hoveredCell = null"
  />
</template>
