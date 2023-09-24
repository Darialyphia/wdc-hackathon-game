<script setup lang="ts">
import { PTransition, useApplication } from 'vue3-pixi';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Resource, Texture, Container, Cursor } from 'pixi.js';
import { getCellAt } from '../../sdk/utils/map.helpers';
import { getEntityAt } from '../../sdk/utils/entity.helpers';
import { getBitMask, getTextureIndexFromBitMask } from '../../sdk/utils/bit-maksing';
import { ColorMatrixFilter } from 'pixi.js';
import type { GameMapCell } from '../../sdk/map';
import { CELL_SIZE } from '../../sdk/constants';

const { x, y, texture } = defineProps<{
  texture: Texture;
  x: number;
  y: number;
}>();

const {
  state,
  activeEntity,
  isMyTurn,
  isInCastRange,
  canSummonAt,
  canMoveTo,
  pathfinder,
  targetMode,
  hoveredCell
} = useGame();
const { isPlaying } = useFXSequencer();
const cell = computed(() => getCellAt(state.value, { x, y }));

const isHoveringActiveEntity = computed(
  () => hoveredCell.value === getCellAt(state.value, activeEntity.value.position)
);
const isValidSummonTarget = computed(() => {
  if (!cell.value) return;

  return canSummonAt(cell.value);
});

const isValidMoveTarget = (cell: GameMapCell) => {
  if (!cell) return false;
  const entity = getEntityAt(state.value, cell);

  if (!canMoveTo(cell)) return false;

  return (
    !entity || entity === activeEntity.value || entity.owner === activeEntity.value.owner
  );
};

const isHighlighted = computed(() => {
  if (!cell.value) return;
  if (!isMyTurn.value) return;

  if (targetMode.value === 'skill') return isInCastRange(cell.value);
  if (targetMode.value === 'summon') return isValidSummonTarget.value;
  if (targetMode.value === 'move') return isValidMoveTarget(cell.value);

  return isHoveringActiveEntity.value && isValidMoveTarget(cell.value);
});

const pathFilter = new ColorOverlayFilter(0x9edfff, 0.5);

const filters = computed(() => {
  return cell.value && getEntityAt(state.value, cell.value) ? [pathFilter] : [];
  // if (!cell.value) return [];
  // if (!hoveredCell.value) return [];
  // if (!isMyTurn.value) return [];
  // if (targetMode.value !== 'move') return [];

  // const hasAlly =
  //   getEntityAt(state.value, cell.value)?.owner === activeEntity.value.owner;
  // if (!isValidMoveTarget(cell.value) && !hasAlly) return;
  // const path = pathfinder.value.findPath(
  //   {
  //     x: Math.round(activeEntity.value.position.x),
  //     y: Math.round(activeEntity.value.position.y)
  //   },
  //   hoveredCell.value
  // );
  // const isInPath = path.some(
  //   ([pathX, pathY], index) =>
  //     x === pathX && y === pathY && index <= activeEntity.value.ap
  // );
  // return isInPath ? [pathFilter] : [];
});

const { resolveTileset } = useAssets();

const bitMask = computed(() => {
  if (!cell.value) return null;
  if (!isMyTurn.value) return null;
  if (isPlaying.value) return null;

  return getBitMask(state.value, cell.value, neighbor => {
    if (!neighbor) return false;
    if (targetMode.value === 'skill') {
      return isInCastRange(neighbor);
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
const skillTargetFilter = new ColorMatrixFilter();
skillTargetFilter.tint(0xff0000, false);

const overlayFilters = computed(() =>
  targetMode.value === 'skill' ? [skillTargetFilter] : []
);
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

const app = useApplication();
const cursor = computed(() => {
  if (cell.value && targetMode.value === 'move' && isValidMoveTarget(cell.value)) {
    return app.value.renderer.events.cursorStyles.move as Cursor;
  }
  if (targetMode.value === 'summon' && isValidSummonTarget.value) {
    return app.value.renderer.events.cursorStyles.summon as Cursor;
  }
  return undefined;
});

const { resolveFx } = useAssets();

const hoveredCellTextures = createSpritesheetFrameObject(
  'idle',
  resolveFx('hoveredCell')
) as unknown as Texture[];
</script>

<template>
  <container
    :filters="filters"
    @pointerenter="hoveredCell = cell"
    @pointerleave="hoveredCell = null"
  >
    <sprite :texture="texture">
      <animated-sprite
        v-if="hoveredCell === cell && hoveredCellTextures"
        :x="CELL_SIZE / 2"
        :y="CELL_SIZE / 2"
        :event-mode="'none'"
        :anchor="0.5"
        playing
        :textures="hoveredCellTextures"
      />
    </sprite>

    <PTransition appear @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
      <container
        v-if="bitMaskTexture && isHighlighted"
        ref="overlay"
        :filters="overlayFilters"
      >
        <sprite :texture="bitMaskTexture" :cursor="cursor" event-mode="static" />
      </container>
    </PTransition>
  </container>
</template>
