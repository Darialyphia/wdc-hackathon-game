<script setup lang="ts">
import type { Entity } from '../../game-logic/entity';
import { CELL_SIZE } from '../../game-logic/constants';
import { getCellAt } from '../../game-logic/utils/map.helpers';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { game, state, useSkill, selectedSkill } = useGame();
const { resolveSprite } = useAssets();
const textures = computed(() =>
  Object.values(resolveSprite(entity.blueprint.spriteId).textures)
);

const onClick = () => {
  if (selectedSkill.value) {
    useSkill(getCellAt(state.value, entity.position)!);
  }
};
</script>

<template>
  <container
    :z-index="entity.position.y"
    :x="entity.position.x * CELL_SIZE + CELL_SIZE / 2"
    :y="entity.position.y * CELL_SIZE + CELL_SIZE / 2"
    @click="onClick"
  >
    <animated-sprite
      v-if="textures?.length"
      :textures="textures"
      :scale-x="entity.owner === game.players[0].userId ? 1 : -1"
      :anchor="0.5"
      playing
      loop
    />

    <graphics
      :z-index="entity.position.y + 1"
      :x="-CELL_SIZE / 2"
      :y="CELL_SIZE / 2 - 3"
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
    ></graphics>
  </container>
</template>
