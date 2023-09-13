<script setup lang="ts">
import type { Entity } from '../../game-logic/entity';
import { CELL_SIZE } from '../../game-logic/constants';
import { getCellAt } from '../../game-logic/utils/map.helpers';
import { OutlineFilter } from '@pixi/filter-outline';
import type { Texture } from 'pixi.js';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { game, state, useSkill, selectedSkill, activeEntity, selectedEntity } = useGame();
const { resolveSprite } = useAssets();
const textures = computed(() =>
  createSpritesheetFrameObject('idle', resolveSprite(entity.blueprint.spriteId))
);

const onClick = () => {
  if (selectedSkill.value) {
    useSkill(getCellAt(state.value, entity.position)!);
  }
};

const outlineFilter = new OutlineFilter(1, 0xffffff, 0.2, 0.5);
const filters = computed(() =>
  activeEntity.value.id === entity.id ? [outlineFilter] : []
);

const circleSize = 6;
const textStyle = {
  fontSize: 22,
  fontFamily: 'monospace',
  fill: 'white'
};
</script>

<template>
  <container
    v-if="entity.state === 'ALIVE'"
    :z-index="entity.position.y"
    :x="entity.position.x * CELL_SIZE + CELL_SIZE / 2"
    :y="entity.position.y * CELL_SIZE + CELL_SIZE / 2"
    @pointerenter="selectedEntity = entity"
    @pointerleave="selectedEntity = null"
    @click="onClick"
  >
    <animated-sprite
      v-if="textures?.length"
      :textures="textures as unknown as Texture[]"
      :filters="filters"
      :scale-x="entity.owner === game.players[0].userId ? 1 : -1"
      :anchor="0.5"
      playing
      loop
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
