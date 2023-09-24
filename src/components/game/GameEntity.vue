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

const { entity } = defineProps<{
  entity: Entity;
}>();

const {
  game,
  state,
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

const textures = computed(() =>
  createSpritesheetFrameObject('idle', resolveSprite(entity.blueprint.characterId))
);

const sprite = ref<AnimatedSprite>();

linkSprite(entity.id, sprite);

const activeFilter = new OutlineFilter(2, 0xffffff, 0.2, 0.6);
const targetedOutlineFilter = new OutlineFilter(3, 0xff0000, 0.2, 0.5);
const targetedOverlayFilter = new ColorOverlayFilter(0xff0000, 0.35);
const selectedfilter = new AdjustmentFilter({
  gamma: 1.4,
  contrast: 1.4,
  saturation: 1.25
});

const filters = computed(() => {
  const _filters = [];

  if (selectedEntity.value?.id === entity.id) {
    _filters.push(selectedfilter);
  }
  if (activeEntity.value.id === entity.id) {
    _filters.push(activeFilter);
  }
  const cell = getCellAt(state.value, entity.position);

  if (
    targetMode.value === 'skill' &&
    hoveredCell.value?.x === entity.position.x &&
    hoveredCell.value?.y === entity.position.y &&
    cell &&
    canCastAt(cell) &&
    isInCastRange(cell)
  ) {
    _filters.push(targetedOutlineFilter, targetedOverlayFilter);
  }
  return _filters;
});

const shadowFilters = [new ColorOverlayFilter(0x000000)];

const circleSize = 6;
const textStyle = {
  fontSize: 22,
  fontFamily: 'monospace',
  fill: 'white'
};

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
</script>

<template>
  <container
    v-if="entity.state === 'ALIVE'"
    :z-index="entity.position.y"
    :sortable-children="true"
    :cursor="cursor"
    :pivot-x="-CELL_SIZE / 2"
    @pointerenter="onPointerenter"
    @pointerleave="onPointerleave"
    @pointerdown="onPointerdown($event)"
    @pointerup="onPointerup"
  >
    <PTransition appear @before-enter="onBeforeEnter" @enter="onEnter">
      <animated-sprite
        v-if="textures?.length"
        ref="sprite"
        :z-index="2"
        :textures="textures as unknown as Texture[]"
        :filters="filters"
        :scale-x="entity.owner === game.players[0].userId ? 1 : -1"
        :anchor="0.5"
        loop
        playing
      />
    </PTransition>
    <animated-sprite
      v-if="textures?.length"
      :z-index="1"
      :textures="textures as unknown as Texture[]"
      :filters="shadowFilters"
      :scale-x="entity.owner === game.players[0].userId ? 1 : -1"
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

    <graphics
      v-if="entity.state === 'ALIVE'"
      :z-index="entity.position.y * 2 + 1"
      :x="-CELL_SIZE / 3"
      :y="-CELL_SIZE / 4"
      @render="
        g => {
          g.clear();

          g.lineStyle({
            width: 1,
            color: 'yellow'
          });

          g.beginFill('black');
          g.drawCircle(0, 0, circleSize);
          g.endFill();
        }
      "
    >
      <text :style="textStyle" :anchor="0.5" :scale-x="0.5" :scale-y="0.5">
        {{ entity.attack }}
      </text>
    </graphics>

    <graphics
      v-if="entity.state === 'ALIVE'"
      :z-index="entity.position.y * 2 + 1"
      :x="CELL_SIZE / 3"
      :y="-CELL_SIZE / 4"
      @render="
        g => {
          g.clear();

          g.lineStyle({
            width: 1,
            color: 'red'
          });

          g.beginFill('black');
          g.drawCircle(0, 0, circleSize);
          g.endFill();
        }
      "
    >
      <text :style="textStyle" :anchor="0.5" :scale-x="0.5" :scale-y="0.5">
        {{ entity.defense }}
      </text>
    </graphics>
  </container>
</template>
