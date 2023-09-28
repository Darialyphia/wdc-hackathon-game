<script setup lang="ts">
import { PTransition, useApplication } from 'vue3-pixi';
import type { Entity } from '../../sdk/entity';
import { CELL_SIZE } from '../../sdk/constants';
import { getCellAt } from '../../sdk/utils/map.helpers';
import { OutlineFilter } from '@pixi/filter-outline';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { type Texture } from 'pixi.js';
import type { AnimatedSprite } from 'pixi.js';
import { Power2 } from 'gsap';
import type { FederatedPointerEvent } from 'pixi.js';
import type { Cursor } from 'pixi.js';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import type { AsepriteMeta } from '../../utils/spritesheet-parser';
import { Polygon } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { isTargetTypeValid } from '../../sdk/utils/skill.helpers';
import { AREA_TYPE } from '../../sdk/utils/entityData';

const { entity } = defineProps<{
  entity: Entity;
}>();

const {
  game,
  state,
  rotation,
  useSkill,
  selectedSkill,
  activeEntity,
  selectedEntity,
  isMyTurn,
  targetMode,
  canCastAt,
  isInCastRange,
  hoveredCell
} = useGame();
const { resolveSprite } = useAssets();

const onPointerup = () => {
  console.log(targetMode.value);
  if (selectedSkill.value) {
    useSkill(getCellAt(state.value, entity.position)!);
  }
  targetMode.value = null;
};

const onPointerdown = (event: FederatedPointerEvent) => {
  if (event.button !== 0) return;
  if (isMyTurn.value && entity.id === activeEntity.value.id) {
    targetMode.value = 'move';
  }
};

const onPointerenter = () => {
  if (!targetMode.value) {
    selectedEntity.value = entity;
  }
  hoveredCell.value = getCellAt(state.value, entity.position);
};

const onPointerleave = () => {
  selectedEntity.value = null;
  hoveredCell.value = null;
};
const { linkSprite } = useFXSequencer();

const textures = computed(
  () =>
    createSpritesheetFrameObject(
      'idle',
      resolveSprite(entity.blueprint.characterId)
    ) as unknown as Texture[]
);

const sprite = ref<AnimatedSprite>();

linkSprite(entity.id, sprite);

const activeFilter = new OutlineFilter(2, 0xffffff, 0.2, 0.6);
const targetedOutlineFilter = new GlowFilter({
  outerStrength: 2,
  innerStrength: 1,
  color: 0xff0000,
  alpha: 0.75
});
// const targetedOverlayFilter = new ColorOverlayFilter(0xff0000, 0.35);
const selectedfilter = new AdjustmentFilter({
  gamma: 1.3,
  contrast: 1.25,
  saturation: 1.25
});

const distanceFromHoveredCell = computed(() => {
  if (!hoveredCell.value)
    return { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
  return {
    x: Math.abs(hoveredCell.value.x - entity.position.x),
    y: Math.abs(hoveredCell.value.y - entity.position.y)
  };
});

const isInSkillArea = computed(() => {
  if (!isMyTurn.value) return false;
  if (!hoveredCell.value) return false;
  if (targetMode.value !== 'skill') return false;
  if (!selectedSkill.value) return false;
  if (!canCastAt(hoveredCell.value)) return false;
  if (!isInCastRange(hoveredCell.value)) return false;
  if (
    !isTargetTypeValid(entity.position, {
      state: state.value,
      caster: activeEntity.value,
      skill: selectedSkill.value
    })
  ) {
    return false;
  }
  const { areaType } = selectedSkill.value;
  switch (areaType) {
    case AREA_TYPE.CROSS:
      return (
        (entity.position.x === hoveredCell.value.x &&
          distanceFromHoveredCell.value.x < selectedSkill.value.areaSize) ||
        (entity.position.y === hoveredCell.value.y &&
          distanceFromHoveredCell.value.y < selectedSkill.value.areaSize)
      );
    case AREA_TYPE.LINE:
      if (hoveredCell.value.x === activeEntity.value.position.x) {
        return (
          entity.position.x === hoveredCell.value.x &&
          distanceFromHoveredCell.value.x < selectedSkill.value.areaSize
        );
      } else if (hoveredCell.value.y === activeEntity.value.position.y) {
        return (
          entity.position.y === hoveredCell.value.y &&
          distanceFromHoveredCell.value.y < selectedSkill.value.areaSize
        );
      }
      return false;

    case AREA_TYPE.SQUARE:
      return (
        distanceFromHoveredCell.value.x < selectedSkill.value.areaSize &&
        distanceFromHoveredCell.value.y < selectedSkill.value.areaSize
      );

    default:
      return exhaustiveSwitch(areaType);
  }
});
const filters = computed(() => {
  const _filters = [];

  if (selectedEntity.value?.id === entity.id) {
    _filters.push(selectedfilter);
  }
  if (activeEntity.value.id === entity.id) {
    _filters.push(activeFilter);
  }

  if (isInSkillArea.value) {
    _filters.push(targetedOutlineFilter);
  }
  return _filters;
});

const shadowFilters = [new ColorOverlayFilter(0x000000)];

const onBeforeEnter = (el: AnimatedSprite) => {
  nextTick(() => {
    gsap.set(el, {
      pixi: {
        alpha: 0,
        scaleX: entity.owner === game.value.players[0].userId ? 0.5 : -0.5,
        scaleY: 0.5,
        y: CELL_SIZE / 2
      }
    });
  });
};

const onEnter = (el: AnimatedSprite, done: () => void) => {
  gsap.to(el, {
    duration: 0.5,
    ease: Power2.easeOut,
    onComplete: done,
    delay: 0,
    pixi: {
      alpha: 1,
      scaleX: entity.owner === game.value.players[0].userId ? 1 : -1,
      scaleY: 1,
      y: 0
    }
  });
};

const app = useApplication();
const cursor = computed(() => {
  const cell = getCellAt(state.value, entity.position);

  if (
    targetMode.value === 'skill' &&
    hoveredCell.value?.x === entity.position.x &&
    hoveredCell.value?.y === entity.position.y &&
    cell &&
    canCastAt(cell) &&
    isInCastRange(cell)
  ) {
    return app.value.renderer.events.cursorStyles.attack as Cursor;
  }
  return undefined;
});

const scaleX = computed(() => {
  if (rotation.value === 90 || rotation.value === 180) {
    return entity.owner === game.value.players[0].userId ? -1 : 1;
  }

  return entity.owner === game.value.players[0].userId ? 1 : -1;
});

const hitArea = computed(() => {
  const sprite = resolveSprite(entity.characterId);
  const meta = sprite.data.meta as AsepriteMeta;
  if (!meta.slices) return undefined;

  const hitAreaSlice = meta.slices.find(slice => slice.name === 'hitArea');
  if (!hitAreaSlice) return undefined;

  const {
    bounds: { x, y, w, h }
  } = hitAreaSlice.keys[0];
  // we need to offset the slice because the sprite has its anchor in the center
  const offset = {
    x: meta.size.w / Object.keys(sprite.data.frames).length / 2,
    y: meta.size.h / 2
  };
  return new Polygon([
    { x: x - offset.x, y: y - offset.y },
    { x: x + w - offset.x, y: y - offset.y },
    { x: x + w - offset.x, y: y + h - offset.y },
    { x: x - offset.x, y: y + h - offset.y }
  ]);
});
</script>

<template>
  <container
    v-if="entity.state === 'ALIVE'"
    :z-index="entity.position.y"
    :sortable-children="true"
    :cursor="cursor"
    :pivot-x="rotation % 180 === 90 ? CELL_SIZE / 2 : -CELL_SIZE / 2"
    :event-mode="
      targetMode === 'move' && entity.id !== activeEntity.id ? 'none' : 'static'
    "
    @pointerenter="onPointerenter"
    @pointerleave="onPointerleave"
    @pointerdown="onPointerdown($event)"
    @pointerup="onPointerup"
  >
    <PTransition appear @before-enter="onBeforeEnter" @enter="onEnter">
      <animated-sprite
        v-if="textures?.length"
        ref="sprite"
        :textures="textures"
        :z-index="2"
        :filters="filters"
        :scale-x="scaleX"
        :anchor="0.5"
        loop
        playing
        :hit-area="hitArea"
      />
    </PTransition>
    <animated-sprite
      v-if="textures?.length"
      :textures="textures"
      :z-index="1"
      :filters="shadowFilters"
      :scale-x="scaleX"
      :scale-y="0.3"
      :skew-x="-1"
      :x="5"
      :y="12"
      :anchor="0.5"
      loop
      playing
    />

    <StatBar
      :z-index="entity.position.y"
      :y="CELL_SIZE * 0.65 - 6"
      :size="3"
      :value="entity.hp"
      :max-value="entity.blueprint.maxHp"
      :filled-color="0x00cc00"
      :empty-color="0xcc0000"
    />

    <StatBar
      :z-index="entity.position.y"
      :y="CELL_SIZE * 0.65 - 3"
      :size="3"
      :value="entity.ap"
      :max-value="entity.maxAp"
      :filled-color="0x0000cc"
    />
  </container>
</template>
