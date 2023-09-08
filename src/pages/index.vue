<script setup lang="ts">
import { createGameState, type GameState } from '@/game-logic';
import { createPlayerAbility } from '@/game-logic/abilities/player.ability';
import { createMoveAction } from '@/game-logic/actions/move';
import { createSummonAction } from '@/game-logic/actions/summon';
import { reducer, type GameEvent } from '@/game-logic/events/reducer';
import type { GameMapCell } from '@/game-logic/map';
import { getActiveEntity } from '@/game-logic/utils/entity.helpers';
import { createPathFinder } from '@/game-logic/utils/pathfinding.helpers';
import type { Nullable } from '@/utils/types';
import { subject } from '@casl/ability';
import { isGeneral } from '@/game-logic/utils/entity.helpers';
import type { SoldierData } from '@/resources/soldiers';
import { getSummonBlueprints } from '@/game-logic/utils/entity.helpers';

definePage({
  name: 'Home'
});

const gameState = ref(
  createGameState({
    players: [
      {
        id: 'player 1',
        characterId: 'haven_hero'
      },
      {
        id: 'player 2',
        characterId: 'necro_hero'
      }
    ]
  })
);
const selectedSummon = ref<Nullable<SoldierData>>();
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
  return ability.can('summon_at', subject('position', cell));
};

const isHighlighted = (cell: GameMapCell) => {
  if (selectedSummon.value) return canSummonAt(cell);
  return canMoveTo(cell);
};

const eventLog = ref<GameEvent[]>([]);
const processAction = (action: (state: GameState) => GameEvent[]) => {
  const events = action(gameState.value);
  events.forEach(event => {
    eventLog.value.push(event);
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

  return Object.values(getSummonBlueprints(activeEntity.value));
});

const canSummon = (blueprint: SoldierData) => {
  const ability = createPlayerAbility(gameState.value, activeEntity.value.owner);
  return ability.can('summon', subject('soldier', blueprint));
};
</script>

<template>
  <main>
    <aside class="action-bar">
      <div>
        <h2>{{ activeEntity.blueprint.name }}</h2>
        <h3>Summon</h3>
        <UiGhostButton
          v-for="summon in availableSummons"
          :key="summon.characterId"
          :disabled="!canSummon(summon)"
          :theme="{
            colorHsl:
              selectedSummon?.characterId === summon.characterId
                ? 'color-primary-hsl'
                : undefined
          }"
          @click="selectedSummon = summon"
        >
          {{ summon.name }} ({{ summon.cost }}AP)
        </UiGhostButton>
        <div
          v-if="isGeneral(activeEntity) && activeEntity.hasSummonned"
          class="p-2 bg-surface-2"
        >
          You already have summoned this turn
        </div>

        <h3>Abilities</h3>
        <UiGhostButton v-for="skill in activeEntity.blueprint.skills" :key="skill.id">
          {{ skill.name }} ({{ skill.cost }}AP)
        </UiGhostButton>
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
        :style="{
          '--x': entity.position.x + 1,
          '--y': entity.position.y + 1,
          '--color': entity.owner === gameState.players[0] ? '#550000' : '#000055'
        }"
        :class="[
          'entity',
          entity.kind,
          { 'is-active': entity.id === gameState.activeEntityId }
        ]"
      >
        <div class="i-mdi:crown icon" />
        {{ entity.blueprint.name }}
        <div>AP: {{ entity.ap }} / {{ entity.maxAp }}</div>
        <div class="atb" :style="{ '--filled': Math.min(100, entity.atb) }" />
      </div>
    </div>
    <aside class="event-logs-sidebar">
      <h2>Event Logs</h2>
      <TransitionGroup tag="div" name="log" class="event-logs">
        <pre v-for="(event, index) in eventLog" :key="index">{{ event }}</pre>
      </TransitionGroup>
    </aside>
  </main>
</template>

<style scoped lang="postcss">
main {
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr max-content 1fr;
  gap: var(--size-3);

  padding: 0;
  padding-inline: var(--size-4);
}

h2 {
  font-size: var(--font-size-5);
}

h3 {
  font-size: var(--font-size-4);
}
.action-bar {
  > div {
    position: sticky;
    top: 0;
  }
}

.event-logs-sidebar {
  overflow-y: auto;
  font-size: var(--font-size-00);
}

.event-logs {
  display: flex;
  flex-direction: column-reverse;
}
.grid {
  overflow-y: auto;
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

    transition: grid-column 0.3s;
  }
}

.cell {
  border: solid 1px var(--primary);

  &.is-highlighted {
    background-color: hsl(var(--color-primary-hover-hsl) / 0.35);
  }
}

.entity {
  position: relative;
  color: var(--gray-1);
  background-color: var(--color);

  &:not(.general) .icon {
    display: none;
  }

  &.is-active {
    border: solid 2px red;
  }

  .icon {
    position: absolute;
    top: calc(-1 * var(--size-1));
    left: 0;

    width: 1.5em !important;
    height: 1.5em !important;
  }
}

.atb {
  position: absolute;
  bottom: 0;
  transform-origin: center left;
  transform: scaleX(calc(1% * var(--filled)));

  width: 100%;
  height: 3px;

  background-color: var(--text-1);

  transition: transform 0.3s;
}

.log-move,
.log-enter-active,
.log-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.log-enter-from,
.log-leave-to {
  transform: translate(30px, 0);
  opacity: 0;
}

.log-leave-active {
  position: absolute;
}
</style>
