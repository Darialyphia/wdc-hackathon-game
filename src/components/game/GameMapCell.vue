<script setup lang="ts">
import { CELL_SIZE } from '../../game-logic/constants';
import { getEntityAt } from '../../game-logic/utils/entity.helpers';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import type { Texture } from 'pixi.js';
import type { GameMapCell } from '../../game-logic/map';
import { subject } from '@casl/ability';
import { createPlayerAbility } from '../../game-logic/abilities/player.ability';

const { cell, texture } = defineProps<{
  texture: Texture;
  cell: GameMapCell;
}>();

const { state, activeEntity, isMyTurn, selectedSkill, selectedSummon, pathfinder } =
  useGame();

const canSummonAt = (cell: GameMapCell) => {
  const ability = createPlayerAbility(state.value, activeEntity.value.owner);
  return ability.can('summon_at', subject('position', cell));
};

const isInCastRange = (cell: GameMapCell) => {
  if (!selectedSkill.value) return;
  return (
    Math.abs(cell.x - activeEntity.value.position.x) <= selectedSkill.value.range &&
    Math.abs(cell.y - activeEntity.value.position.y) <= selectedSkill.value.range
  );
};

const canMoveTo = (cell: GameMapCell) => {
  const path = pathfinder.value.findPath(activeEntity.value.position, cell);

  return path.length > 0 && path.length <= activeEntity.value.ap;
};

const isHighlighted = computed(() => {
  if (!isMyTurn.value) return;
  if (selectedSummon.value) return canSummonAt(cell);
  if (selectedSkill.value) return isInCastRange(cell);

  return canMoveTo(cell);
});

const targetableFilter = new AdjustmentFilter({ gamma: 1.8, contrast: 1.5 });

const filters = computed(() => (isHighlighted.value ? [targetableFilter] : []));

const isHovering = ref(false);
const borderStyle = computed(() =>
  isHovering.value
    ? {
        color: 'black',
        alpha: 0.5,
        width: 2
      }
    : {
        color: 'black',
        alpha: 0.25,
        width: 1
      }
);
</script>

<template>
  <sprite
    :key="`${cell.x}:${cell.y}`"
    :x="cell.x * CELL_SIZE"
    :y="cell.y * CELL_SIZE"
    :texture="texture"
    :filters="filters"
    @pointerenter="isHovering = true"
    @pointerleave="isHovering = false"
  >
    <graphics
      @render="
        g => {
          g.clear();
          g.lineStyle(borderStyle);
          if (isHovering) {
            g.drawRect(1, 1, CELL_SIZE - 2, CELL_SIZE - 2);
          } else {
            g.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
          }
        }
      "
    />
  </sprite>
</template>
