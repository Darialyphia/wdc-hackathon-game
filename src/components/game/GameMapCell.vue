<script setup lang="ts">
import { CELL_SIZE } from '../../sdk/constants';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { ColorGradientFilter } from '@pixi/filter-color-gradient';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Resource, Texture } from 'pixi.js';
import { subject } from '@casl/ability';
import { getCellAt } from '../../sdk/utils/map.helpers';
import { createSkillAbility } from '../../sdk/abilities/skill.ability';
import { getEntityAt } from '../../sdk/utils/entity.helpers';
import { getBitMask, getTextureIndexFromBitMask } from '../../sdk/utils/bit-maksing';
import type { Filter } from 'pixi.js';

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
  canMoveTo,
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

  return canMoveTo(cell.value) && !getEntityAt(state.value, cell.value);
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

const skillTargetableFilter = new ColorOverlayFilter(0xff0000, 0.25);
const pathFilter = new ColorOverlayFilter(0x99aaff, 0.5);
const hoverFilter = new ColorGradientFilter({
  type: ColorGradientFilter.RADIAL,
  stops: [
    { offset: 0.0, color: 'white', alpha: 0 },
    { offset: 0.5, color: 'white', alpha: 0 },
    { offset: 1.0, color: 'white', alpha: 0.3 }
  ]
});

const filters = computed(() => {
  const f: Filter[] = [];
  if (!cell.value) return f;
  if (!hoveredCell.value) return f;
  if (hoveredCell.value === cell.value) f.push(hoverFilter);
  if (isValidSkillTarget.value) f.push(skillTargetableFilter);

  if (!hoveredCell.value || targetMode.value !== 'move') return f;

  const hasAlly =
    getEntityAt(state.value, cell.value)?.owner === activeEntity.value.owner;
  if (isValidMoveTarget.value || hasAlly) {
    const path = pathfinder.value.findPath(
      {
        x: Math.round(activeEntity.value.position.x),
        y: Math.round(activeEntity.value.position.y)
      },
      hoveredCell.value
    );
    const isInPath = path.some(
      ([pathX, pathY], index) =>
        x === pathX && y === pathY && index <= activeEntity.value.ap
    );
    if (isInPath) {
      // _filters.push(pathFilter);
      return [pathFilter];
    }
  }
  // return _filters;
});

const { resolveTileset } = useAssets();

const bitMask = computed(() => {
  if (!cell.value) return null;
  if (!isMyTurn.value) return null;

  return getBitMask(state.value, cell.value, neighbor => {
    if (!neighbor) return false;
    if (targetMode.value === 'skill') return false;
    if (targetMode.value === 'summon') {
      return canSummonAt(neighbor);
    }

    if (
      targetMode.value === null &&
      hoveredCell.value !== getCellAt(state.value, activeEntity.value.position)
    ) {
      return false;
    }

    return !!(canMoveTo(neighbor) && !getEntityAt(state.value, neighbor));
  });
});

const targetableTileset = resolveTileset('targetable_cell');
const bitMaskTexture = ref<Texture<Resource>>();

watch(
  bitMask,
  (newBitMask, oldBitMask) => {
    if (newBitMask === oldBitMask) return;
    if (!newBitMask) return;

    bitMaskTexture.value = getTextureIndexFromBitMask(newBitMask, targetableTileset);
  },
  { immediate: true }
);
</script>

<template>
  <container
    :x="x * CELL_SIZE"
    :y="y * CELL_SIZE"
    @pointerenter="hoveredCell = cell"
    @pointerleave="hoveredCell = null"
    @click="selectedEntity = null"
  >
    <sprite :texture="texture" :filters="filters" />
    <container v-if="bitMaskTexture && isHighlighted" :alpha="0.75">
      <sprite :texture="bitMaskTexture" event-mode="static" />
    </container>
  </container>
</template>
