<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Resource, Texture, Container, Cursor } from 'pixi.js';
import { getCellAt } from '../../sdk/utils/map.helpers';
import { getEntityAt } from '../../sdk/utils/entity.helpers';
import { getBitMask, getTextureIndexFromBitMask } from '../../sdk/utils/bit-maksing';
import { ColorMatrixFilter } from 'pixi.js';
import type { GameMapCell } from '../../sdk/map';
import { createSkillAbility } from '../../sdk/abilities/skill.ability';
import { subject } from '@casl/ability';
import { HslAdjustmentFilter } from '@pixi/filter-hsl-adjustment';

const { cell, cursor } = defineProps<{
  cursor?: Cursor;
  cell: GameMapCell;
}>();

const {
  state,
  activeEntity,
  isMyTurn,
  canSummonAt,
  canMoveTo,
  targetMode,
  hoveredCell,
  rotation,
  selectedSkill
} = useGame();
const { isPlaying } = useFXSequencer();

const isHoveringActiveEntity = computed(
  () => hoveredCell.value === getCellAt(state.value, activeEntity.value.position)
);

const isValidSummonTarget = computed(() => {
  if (!cell) return;

  return canSummonAt(cell);
});

const isValidMoveTarget = (cell: GameMapCell) => {
  if (!cell) return false;
  const entity = getEntityAt(state.value, cell);

  if (!canMoveTo(cell)) return false;

  return (
    !entity || entity === activeEntity.value || entity.owner === activeEntity.value.owner
  );
};

const isSkillHighlighted = (cell: GameMapCell) => {
  if (!selectedSkill.value) return false;

  const ability = createSkillAbility(
    state.value,
    selectedSkill.value,
    activeEntity.value
  );

  return ability.can('highlight', subject('cell', { x: cell.x, y: cell.y }));
};

const isHighlighted = computed(() => {
  if (!cell) return;
  if (!isMyTurn.value) return;

  switch (targetMode.value) {
    case 'skill':
      return isSkillHighlighted(cell);
    case 'summon':
      return isValidSummonTarget.value;
    case 'move':
      return (
        isValidMoveTarget(cell) &&
        activeEntity.value.movedAmount < activeEntity.value.speed
      );
    default:
      return isHoveringActiveEntity.value && isValidMoveTarget(cell);
  }
});

const { resolveTileset } = useAssets();

const bitMask = computed(() => {
  if (!cell) return null;
  if (!isMyTurn.value) return null;
  if (isPlaying.value) return null;

  return getBitMask(state.value, cell, rotation.value, neighbor => {
    if (!neighbor) return false;
    if (targetMode.value === 'skill') {
      return isSkillHighlighted(neighbor);
    }
    if (targetMode.value === 'summon') {
      return canSummonAt(neighbor) && !getEntityAt(state.value, neighbor);
    }

    return isValidMoveTarget(neighbor);
  });
});

const targetableTileset = resolveTileset('targetable_cell');
const bitMaskTexture = ref<Texture<Resource>>();

watch(
  bitMask,
  (newBitMask, oldBitMask) => {
    if (newBitMask === oldBitMask) return;
    if (!isDefined(newBitMask)) return;

    bitMaskTexture.value = getTextureIndexFromBitMask(newBitMask, targetableTileset);
  },
  { immediate: true }
);

const overlay = ref<Container>();
// const skillTargetFilter = new ColorMatrixFilter();
// skillTargetFilter.hue(100, true);
// skillTargetFilter.saturate(1, true);
const skillTargetFilter = new HslAdjustmentFilter({
  hue: 150,
  lightness: -0.4,
  saturation: 0.8
});

const filters = computed(() => (targetMode.value === 'skill' ? [skillTargetFilter] : []));
const onBeforeEnter = (el: Container) => {
  nextTick(() => {
    gsap.set(el, {
      pixi: {
        alpha: 0
      }
    });
  });
};

const onEnter = (el: Container, done: () => void) => {
  gsap.to(el, {
    duration: 0.5,
    ease: Power2.easeOut,
    onComplete: done,
    pixi: {
      alpha: 1
    }
  });
};
const onLeave = (el: Container, done: () => void) => {
  gsap.to(el, {
    duration: 0.5,
    ease: Power2.easeOut,
    onComplete: done,
    pixi: {
      alpha: 0
    }
  });
};
</script>

<template>
  <PTransition appear @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
    <container v-if="bitMaskTexture && isHighlighted" ref="overlay" :filters="filters">
      <sprite :texture="bitMaskTexture" :cursor="cursor" event-mode="none" />
    </container>
  </PTransition>
</template>
