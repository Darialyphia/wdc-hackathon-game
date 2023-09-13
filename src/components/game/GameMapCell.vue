<script setup lang="ts">
import { CELL_SIZE } from '../../game-logic/constants';
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
  const path = pathfinder.value.findPath(
    {
      x: Math.round(activeEntity.value.position.x),
      y: Math.round(activeEntity.value.position.y)
    },
    cell
  );

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
const onPointerenter = () => {
  isHovering.value = true;
};
const onPointerleave = () => {
  isHovering.value = false;
};
</script>

<template>
  <container @pointerenter="onPointerenter()" @pointerleave="onPointerleave()">
    <sprite
      :key="`${cell.x}:${cell.y}`"
      :x="cell.x * CELL_SIZE"
      :y="cell.y * CELL_SIZE"
      :texture="texture"
      :filters="filters"
      :scale-x="1.5"
      :scale-y="1.5"
      @pointerenter="onPointerenter()"
      @pointerleave="onPointerleave()"
    />
    <graphics
      :x="cell.x * CELL_SIZE"
      :y="cell.y * CELL_SIZE"
      @render="
        g => {
          g.clear();
          if (isHovering) {
            g.beginFill('white', 0.15);
          }
          g.lineStyle({
            color: 'black',
            alpha: 0.25,
            width: 1
          });
          g.drawRect(0, 0, CELL_SIZE, CELL_SIZE);

          g.endFill();
        }
      "
    />
  </container>
</template>
