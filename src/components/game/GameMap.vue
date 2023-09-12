<script setup lang="ts">
import type { GameMapCell } from '../../game-logic/map';

const { resolveTileset } = useAssets();
const textures = computed(() => Object.values(resolveTileset('base').textures));

const { state, selectedSummon, selectedSkill, summon, useSkill, move } = useGame();

const onClick = (cell: GameMapCell) => {
  if (selectedSummon.value) {
    summon(cell);
  } else if (selectedSkill.value) {
    useSkill(cell);
  } else {
    move(cell);
  }
};
</script>

<template>
  <container>
    <template v-for="row in state.map.rows">
      <GameMapCell
        v-for="cell in row"
        :key="`${cell.x}:${cell.y}`"
        :cell="cell"
        :texture="textures[32]"
        @click="onClick(cell)"
      />
    </template>
  </container>
</template>
