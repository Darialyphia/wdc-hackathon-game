<script setup lang="ts">
import { CELL_SIZE } from '../../sdk/constants';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { ColorGradientFilter } from '@pixi/filter-color-gradient';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Texture } from 'pixi.js';
import { subject } from '@casl/ability';
import { createPlayerAbility } from '../../sdk/abilities/player.ability';
import { getCellAt } from '../../sdk/utils/map.helpers';
import { getBitMask } from '../../sdk/utils/bit-maksing';
import type { GameMapCell } from '../../sdk/map';
import { createSkillAbility } from '../../sdk/abilities/skill.ability';

const { x, y, texture } = defineProps<{
  texture: Texture;
  x: number;
  y: number;
}>();

const {
  state,
  activeEntity,
  isMyTurn,
  canSummonAt,
  selectedSkill,
  selectedEntity,
  pathfinder,
  targetMode,
  hoveredCell
} = useGame();

const cell = computed(() => getCellAt(state.value, { x, y }));
const isValidSummonTarget = computed(() => {
  if (!cell.value) return;

  return canSummonAt(cell.value);
});

const isValidSkillTarget = computed(() => {
  if (!cell.value) return;
  if (!selectedSkill.value) return false;
  if (targetMode.value !== 'skill') return false;

  const ability = createSkillAbility(
    state.value,
    selectedSkill.value,
    activeEntity.value
  );

  return ability.can('highlight', subject('cell', cell.value));
});

const isValidMoveTarget = computed(() => {
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
  if (targetMode.value === 'summon') return isValidSummonTarget.value;

  return (
    (targetMode.value === 'move' ||
      hoveredCell.value === getCellAt(state.value, activeEntity.value.position)) &&
    isValidMoveTarget.value
  );
});

const targetableFilter = new AdjustmentFilter({ gamma: 1.5 });
const skillTargetableFilter = new ColorOverlayFilter(0xff0000, 0.25);
const pathFilter = new ColorOverlayFilter(0x00aaff, 0.35);
const hoverFilter = new ColorGradientFilter({
  type: ColorGradientFilter.RADIAL,
  stops: [
    { offset: 0.0, color: 'white', alpha: 0 },
    { offset: 0.5, color: 'white', alpha: 0 },
    { offset: 1.0, color: 'white', alpha: 0.3 }
  ]
});

const filters = computed(() => {
  if (x < 0 || x > state.value.map.width || y < 0 || y > state.value.map.height) {
    return [];
  }
  if (!cell.value) return [];

  const _filters = [];
  if (isHighlighted.value) _filters.push(targetableFilter);
  if (isValidSkillTarget.value) _filters.push(skillTargetableFilter);
  if (hoveredCell.value === cell.value) _filters.push(hoverFilter);
  if (!hoveredCell.value || targetMode.value !== 'move') return _filters;

  const path = pathfinder.value.findPath(
    {
      x: Math.round(activeEntity.value.position.x),
      y: Math.round(activeEntity.value.position.y)
    },
    hoveredCell.value
  );

  const isInPath = path.some(([pathX, pathY], index) => {
    return x === pathX && y === pathY && index <= activeEntity.value.ap;
  });

  if (isInPath && path.length > 0 && path.length <= activeEntity.value.ap) {
    _filters.push(pathFilter);
  }

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
    @click="selectedEntity = null"
  />
</template>
