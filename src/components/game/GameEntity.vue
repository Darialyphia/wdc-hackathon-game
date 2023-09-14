<script setup lang="ts">
import { PTransition } from 'vue3-pixi';

import type { Entity } from '../../game-logic/entity';
import { CELL_SIZE } from '../../game-logic/constants';
import { getCellAt } from '../../game-logic/utils/map.helpers';
import { OutlineFilter } from '@pixi/filter-outline';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Texture } from 'pixi.js';
import gsap from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';
import type { AnimatedSprite } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { Power2 } from 'gsap';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

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
  hoveredCell
} = useGame();
const { resolveSprite } = useAssets();

const onClick = () => {
  if (selectedSkill.value) {
    useSkill(getCellAt(state.value, entity.position)!);
  }
  targetMode.value = null;
};

const onPointerdown = () => {
  if (isMyTurn.value && entity.id === activeEntity.value.id) {
    targetMode.value = 'move';
  }
};

const onPointerenter = () => {
  selectedEntity.value = entity;
  hoveredCell.value = getCellAt(state.value, entity.position);
};

const onPointerleave = () => {
  selectedEntity.value = null;
  hoveredCell.value = null;
};
const { linkSprite } = useFXSequencer();

const textures = computed(() =>
  createSpritesheetFrameObject('idle', resolveSprite(entity.blueprint.spriteId))
);

const sprite = ref<AnimatedSprite>();

linkSprite(entity.id, sprite);

const outlineFilter = new OutlineFilter(2, 0xffffff, 0.2, 0.5);
const filters = computed(() =>
  activeEntity.value.id === entity.id ? [outlineFilter] : []
);
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
</script>

<template>
  <container
    v-if="entity.state === 'ALIVE'"
    :z-index="entity.position.y"
    :x="entity.position.x * CELL_SIZE + CELL_SIZE / 2"
    :y="entity.position.y * CELL_SIZE + CELL_SIZE / 2"
    :sortable-children="true"
    @pointerenter="onPointerenter"
    @pointerleave="onPointerleave"
    @pointerdown="onPointerdown"
    @click="onClick"
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

    <graphics
      :z-index="entity.position.y + 1"
      :x="-CELL_SIZE / 2"
      :y="CELL_SIZE / 2 - 6"
      @render="
        g => {
          g.clear();

          g.lineStyle({
            width: 1,
            color: 0xcc0000,
            alpha: 0
          });
          g.beginFill(0xcc0000);
          g.drawRect(0, 0, CELL_SIZE, 3);
          g.beginFill(0x00cc00);
          g.drawRect(0, 0, (entity.hp * CELL_SIZE) / entity.blueprint.maxHp, 3);
          g.endFill();

          g.lineStyle({
            width: 0.5,
            color: 'black',
            alpha: 1
          });
          g.drawRect(0, 0, CELL_SIZE, 3);
        }
      "
    />
    <graphics
      :z-index="entity.position.y + 1"
      :x="-CELL_SIZE / 2"
      :y="CELL_SIZE / 2 - 3"
      @render="
        g => {
          g.clear();

          g.beginFill(0x0000ff);
          g.drawRect(0, 0, (entity.ap * CELL_SIZE) / entity.maxAp, 3);
          g.endFill();

          g.lineStyle({
            width: 0.5,
            color: 0x000000,
            alpha: 1
          });
          g.drawRect(0, 0, CELL_SIZE, 3);
        }
      "
    />
  </container>

  <graphics
    v-if="entity.state === 'ALIVE'"
    :z-index="entity.position.y * 2 + 1"
    :x="entity.position.x * CELL_SIZE + circleSize / 2"
    :y="entity.position.y * CELL_SIZE + circleSize / 2"
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
      {{ entity.blueprint.attack }}
    </text>
  </graphics>

  <graphics
    v-if="entity.state === 'ALIVE'"
    :z-index="entity.position.y * 2 + 1"
    :x="entity.position.x * CELL_SIZE + CELL_SIZE - circleSize / 2"
    :y="entity.position.y * CELL_SIZE + circleSize / 2"
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
      {{ entity.blueprint.defense }}
    </text>
  </graphics>
</template>
