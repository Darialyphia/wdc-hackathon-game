<script setup lang="ts">
import { createGameState, type GameState } from '@/game-logic';
import { createPlayerAbility } from '@/game-logic/abilities/player.ability';
import { createMoveAction } from '@/game-logic/actions/move';
import { createSummonAction } from '@/game-logic/actions/summon';
import { reducer, type GameEvent } from '@/game-logic/events/reducer';
import type { GameMapCell } from '@/game-logic/map';
import type { SummonBlueprint } from '@/game-logic/summon';
import { getActiveEntity } from '@/game-logic/utils/entity.helpers';
import { createPathFinder } from '@/game-logic/utils/pathfinding.helpers';
import type { Nullable } from '@/utils/types';
import { subject } from '@casl/ability';

definePage({
  name: 'Home'
});

const gameState = ref(
  createGameState({
    players: [
      {
        id: 'player 1',
        characterId: 'Hero 1',
        summonBlueprints: [
          {
            characterId: 'Swordsman',
            cost: 2
          },
          {
            characterId: 'Archer',
            cost: 2
          },
          {
            characterId: 'Knight',
            cost: 3
          },
          {
            characterId: 'Angel',
            cost: 4
          }
        ]
      },
      {
        id: 'player 2',
        characterId: 'Hero 2',
        summonBlueprints: [
          {
            characterId: 'Skeleton',
            cost: 2
          },
          {
            characterId: 'Zombie',
            cost: 2
          },
          {
            characterId: 'Vampire',
            cost: 3
          },
          {
            characterId: 'Bone Dragon',
            cost: 4
          }
        ]
      }
    ]
  })
);
const selectedSummon = ref<Nullable<SummonBlueprint>>();
const activeEntity = computed(() => getActiveEntity(gameState.value));

const pathFinder = computed(() =>
  createPathFinder(gameState.value, gameState.value.activeEntityId)
);

const canMoveTo = (cell: GameMapCell) => {
  const path = pathFinder.value.findPath(activeEntity.value.position, cell);

  return path.length > 0 && path.length <= activeEntity.value.ap;
};

const canSummonAt = (cell: GameMapCell) => {
  const ability = createPlayerAbility(gameState.value, activeEntity.value.owner);
  const r = ability.can('summon_at', subject('position', cell));

  return r;
};

const isHighlighted = (cell: GameMapCell) => {
  if (selectedSummon.value) return canSummonAt(cell);
  return canMoveTo(cell);
};

const processAction = (action: (state: GameState) => GameEvent[]) => {
  const events = action(gameState.value);
  events.forEach(event => {
    reducer(gameState.value, event);
  });
};

const moveAction = (cell: GameMapCell) => {
  if (!canMoveTo(cell)) return;
  const action = createMoveAction({
    playerId: activeEntity.value.owner,
    entityId: activeEntity.value.id,
    target: cell
  });

  processAction(action);
};

const summonAction = (cell: GameMapCell) => {
  if (!canSummonAt(cell)) {
    selectedSummon.value = null;
  }
  if (!selectedSummon.value) return;

  const action = createSummonAction({
    playerId: activeEntity.value.owner,
    characterId: selectedSummon.value.characterId,
    position: { x: cell.x, y: cell.y }
  });

  processAction(action);
  selectedSummon.value = null;
};

const onCellClick = (cell: GameMapCell) => {
  if (selectedSummon.value) {
    summonAction(cell);
  } else {
    moveAction(cell);
  }
};

const availableSummons = computed(() => {
  if (activeEntity.value.kind !== 'general') return [];
  return Object.values(activeEntity.value.summonBlueprints);
});
</script>

<template>
  <main class="container space-y-3" style="--container-size: var(--size-xl)">
    <aside>
      <div>
        <UiGhostButton
          v-for="summon in availableSummons"
          :key="summon.characterId"
          :disabled="activeEntity.ap < summon.cost"
          :theme="{
            colorHsl:
              selectedSummon?.characterId === summon.characterId
                ? 'color-primary-hsl'
                : undefined
          }"
          @click="selectedSummon = summon"
        >
          Summon {{ summon.characterId }} ({{ summon.cost }}AP)
        </UiGhostButton>

        <pre>{{ activeEntity }}</pre>
      </div>
    </aside>
    <div class="grid">
      <template v-for="row in gameState.map.rows">
        <div
          v-for="cell in row"
          :key="`${cell.x}:${cell.y}`"
          :style="{ '--x': cell.x + 1, '--y': cell.y + 1 }"
          :class="['cell', { 'is-highlighted': isHighlighted(cell) }]"
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
        <div>Owner: {{ entity.owner }}</div>
        <div>AP: {{ entity.ap }} / {{ entity.maxAp }}</div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="postcss">
main {
  display: flex;
  gap: var(--size-3);
}

aside {
  flex-basis: var(--size-xxs);
  flex-shrink: 0;
  > div {
    position: sticky;
    top: 0;
  }
}
.grid {
  overflow: auto;
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

  &.is-highlighted {
    background-color: hsl(var(--color-primary-hover-hsl) / 0.35);
  }
}

.entity.is-active {
  border: solid 2px red;
}
</style>
