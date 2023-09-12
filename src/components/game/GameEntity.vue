<script setup lang="ts">
import type { Entity } from '../../game-logic/entity';
import { CELL_SIZE } from '../../game-logic/constants';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { game } = useGame();
const { resolveSprite } = useAssets();
const textures = computed(() =>
  Object.values(resolveSprite(entity.blueprint.spriteId).textures)
);
</script>

<template>
  <container
    :z-index="entity.position.y"
    :x="entity.position.x * CELL_SIZE + CELL_SIZE / 2"
    :y="entity.position.y * CELL_SIZE + CELL_SIZE / 2"
  >
    <animated-sprite
      v-if="textures?.length"
      :textures="textures"
      :scale-x="entity.owner === game.players[0]._id ? 1 : -1"
      :anchor="0.5"
      playing
      loop
    />
  </container>
</template>
