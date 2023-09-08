<script setup lang="ts">
import { createGameState } from '@/game-logic';
import { createMoveAction } from '@/game-logic/actions/move';
import { reducer } from '@/game-logic/events/reducer';
import type { GameMapCell } from '@/game-logic/map';
import { getActiveEntity } from '@/game-logic/utils/entity.helpers';
import { createPathFinder } from '@/game-logic/utils/pathfinding.helpers';

definePage({
  name: 'Home'
});

const gameState = ref(
  createGameState({
    players: [
      {
        id: 'player 1',
        characterId: 'Hero 1'
      },
      {
        id: 'player 2',
        characterId: 'Hero 2'
      }
    ]
  })
);
const activeEntity = computed(() => getActiveEntity(gameState.value));

const pathFinder = computed(() =>
  createPathFinder(gameState.value, gameState.value.activeEntityId)
);

const canMoveTo = (cell: GameMapCell) => {
  const path = pathFinder.value.findPath(activeEntity.value.position, cell);

  return path.length > 0 && path.length <= activeEntity.value.ap;
};

const onCellClick = (cell: GameMapCell) => {
  if (!canMoveTo(cell)) return;
  const action = createMoveAction({
    playerId: activeEntity.value.owner,
    entityId: activeEntity.value.id,
    target: cell
  });
  const events = action(gameState.value);

  events.forEach(event => {
    reducer(gameState.value, event);
  });
};
</script>

<template>
  <main class="container space-y-3">
    <div>Active entity: {{ activeEntity.characterId }}</div>
    <div class="grid">
      <template v-for="row in gameState.map.rows">
        <div
          v-for="cell in row"
          :key="`${cell.x}:${cell.y}`"
          :style="{ '--x': cell.x + 1, '--y': cell.y + 1 }"
          :class="['cell', { 'can-move': canMoveTo(cell) }]"
          @click="onCellClick(cell)"
        />
      </template>

      <div
        v-for="entity in gameState.entities"
        :key="entity.id"
        :style="{ '--x': entity.position.x + 1, '--y': entity.position.y + 1 }"
        :class="[
          'entity',
          entity.kind,
          { 'is-active': entity.id === gameState.activeEntityId }
        ]"
      >
        {{ entity.characterId }}
        <div>x:{{ entity.position.x }},y:{{ entity.position.y }}</div>
        <div>AP: {{ entity.ap }} / {{ entity.maxAp }}</div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="postcss">
.grid {
  display: grid;
  grid-template-columns: repeat(v-bind('gameState.map.width'), var(--size-9));
  grid-template-rows: repeat(v-bind('gameState.map.height'), var(--size-9));

  > * {
    display: grid;
    grid-column: var(--x);
    grid-row: var(--y);
    place-content: center;

    font-family: monospace;
    font-size: 0.7rem;
    text-align: center;
  }
}

.cell {
  border: solid 1px var(--primary);

  &.can-move {
    background-color: hsl(var(--color-primary-hover-hsl) / 0.35);
  }
}

.entity.is-active {
  border: solid 2px red;
}
</style>
