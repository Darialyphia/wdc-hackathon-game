<script setup lang="ts">
import { createGameState } from '@/game-logic';
import { createPlayerAbility } from '@/game-logic/abilities/player.ability';
import { createMoveAction } from '@/game-logic/actions/move';
import { createSummonAction } from '@/game-logic/actions/summon';
import { type GameEvent } from '@/game-logic/events/reducer';
import type { GameMapCell } from '@/game-logic/map';
import {
  getActiveEntity,
  getEntityById,
  getSoldierById
} from '@/game-logic/utils/entity.helpers';
import { createPathFinder } from '@/game-logic/utils/pathfinding.helpers';
import type { Nullable } from '@/utils/types';
import { subject } from '@casl/ability';
import { type SoldierData } from '@/resources/soldiers';
import { getSummonBlueprints } from '@/game-logic/utils/entity.helpers';
import { getSkillById } from '@/game-logic/utils/skill.helper';
import { createEndTurnAction } from '@/game-logic/actions/endTurn';
import type { SkillData } from '@/resources/skills';
import { createSkillAbility } from '@/game-logic/abilities/skill.ability';
import { createSkillAction } from '@/game-logic/actions/skill';
import type { Entity, EntityId } from '@/game-logic/entity';
import { getEntityAt } from '@/game-logic/utils/entity.helpers';
import { createEntityAbility } from '@/game-logic/abilities/entity.ability';

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
const getEventLabel = ({ type, payload }: GameEvent) => {
  const getName = (id: EntityId) => getEntityById(gameState.value, id)?.blueprint.name;
  switch (type) {
    case 'end_turn':
      return `------------------------`;
    case 'entity_moved':
      return `${getName(payload.sourceId)} moved.`;
    case 'soldier_summoned':
      return `${getName(payload.sourceId)} summoned ${getSoldierById(payload.characterId)
        ?.name}.`;
    case 'deal_damage':
      return `${getName(payload.sourceId)} dealt ${payload.amount} damage to ${getName(
        payload.targetId
      )}.`;
    case 'skill_used':
      return `${getName(payload.sourceId)} used ${getSkillById(payload.skillId)?.name}.`;
    case 'entity_died':
      return `${getName(payload.targetId)} got killed by ${getName(payload.sourceId)}.`;
    default:
      exhaustiveSwitch(type);
      throw new Error(`exhaustive switch error, unhandled case ${type}`);
  }
};

const logs = ref<string[]>(gameState.value.history.map(getEventLabel));
watch(
  () => gameState.value.history.length,
  (newLength, oldLength) => {
    const newEvents = gameState.value.history.slice(-1 * (newLength - oldLength));

    newEvents.forEach(event => {
      logs.value.push(getEventLabel(event));
    });
  }
);

const selectedSummon = ref<Nullable<SoldierData>>();
const selectedSkill = ref<Nullable<SkillData>>();
const selectedEntity = ref<Entity>(getActiveEntity(gameState.value));

watchEffect(() => {
  selectedEntity.value = getActiveEntity(gameState.value);
});

const selectSummon = (summon: SoldierData) => {
  selectedSummon.value = summon;
  selectedSkill.value = null;
};

const selectSkill = (skill: SkillData) => {
  selectedSkill.value = skill;
  selectedSummon.value = null;
};

const resetSelected = () => {
  selectedSummon.value = null;
  selectedSkill.value = null;
};

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

const canCast = (skill: SkillData) => {
  const ability = createEntityAbility(gameState.value, activeEntity.value);
  return ability.can('cast', subject('skill', { ...skill }));
};

const canCastAt = (cell: GameMapCell) => {
  if (!selectedSkill.value) return;

  const ability = createSkillAbility(
    gameState.value,
    selectedSkill.value,
    activeEntity.value
  );
  return ability.can('target', subject('cell', { x: cell.x, y: cell.y }));
};

const isInCastRange = (cell: GameMapCell) => {
  if (!selectedSkill.value) return;
  return (
    Math.abs(cell.x - activeEntity.value.position.x) <= selectedSkill.value.range &&
    Math.abs(cell.y - activeEntity.value.position.y) <= selectedSkill.value.range
  );
};

const isHighlighted = (cell: GameMapCell) => {
  if (selectedSummon.value) return canSummonAt(cell);
  if (selectedSkill.value) return isInCastRange(cell);

  return canMoveTo(cell);
};

const moveAction = (cell: GameMapCell) => {
  if (!canMoveTo(cell)) return;
  const action = createMoveAction({
    playerId: activeEntity.value.owner,
    target: cell
  });

  action(gameState.value);
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

  action(gameState.value);
  selectedSummon.value = null;
};

const skillAction = (cell: GameMapCell) => {
  if (!canCastAt(cell)) {
    selectedSkill.value = null;
  }
  if (!selectedSkill.value) return;
  const action = createSkillAction({
    playerId: activeEntity.value.owner,
    skillId: selectedSkill.value.id,
    target: { x: cell.x, y: cell.y }
  });

  action(gameState.value);
  selectedSkill.value = null;
};

const endTurnAction = () => {
  const action = createEndTurnAction({
    playerId: activeEntity.value.owner
  });

  action(gameState.value);
};

const onCellClick = (cell: GameMapCell) => {
  if (selectedSummon.value) {
    summonAction(cell);
  } else if (selectedSkill.value) {
    skillAction(cell);
  } else {
    moveAction(cell);
  }
};

const onEntityClick = (entity: Entity) => {
  if (selectedSkill.value || selectedSummon.value) return;

  selectedEntity.value = entity;
};

const availableSummons = computed(() => {
  if (activeEntity.value.kind !== 'general') return [];

  return Object.values(getSummonBlueprints(activeEntity.value));
});

const canSummon = (blueprint: SoldierData) => {
  const ability = createPlayerAbility(gameState.value, activeEntity.value.owner);
  return ability.can('summon', subject('soldier', blueprint));
};

const activeSkills = computed(() =>
  activeEntity.value.blueprint.skills.map(id => getSkillById(id)!)
);

const EntityView = createReusableTemplate<{ entity: Entity }>();

const logSentinel = ref<HTMLElement>();
watch(
  () => gameState.value.history.length,
  () => {
    nextTick(() => {
      logSentinel.value?.scrollIntoView({ behavior: 'smooth' });
    });
  }
);
</script>

<template>
  <main>
    <UiModal
      id="game-resullt"
      :is-opened="gameState.lifecycleState === 'FINISHED'"
      :is-closable="false"
    >
      <UiModalHeader>A general has fallen</UiModalHeader>

      <UiModalContent>{{ gameState.winner }} is victorious</UiModalContent>
    </UiModal>
    <EntityView.define v-slot="{ entity }">
      <div
        tabindex="0"
        :style="{
          '--color': entity.owner === gameState.players[0] ? '#550000' : '#000055'
        }"
        :class="[
          'entity',
          entity.kind,
          { 'is-active': entity.id === gameState.activeEntityId }
        ]"
        @click="onEntityClick(entity)"
      >
        <div class="i-mdi:crown icon" />
        {{ entity.blueprint.name }}
        <div>AP: {{ entity.ap }} / {{ entity.maxAp }}</div>
        <div
          class="hp-bar"
          :style="{ '--filled': (entity.hp * 100) / entity.blueprint.maxHp }"
        />
        <div class="atb-bar" :style="{ '--filled': Math.min(100, entity.atb) }" />
      </div>
    </EntityView.define>
    <aside class="action-bar">
      <div>
        <h2>{{ selectedEntity.blueprint.name }}</h2>
        <pre>{{ selectedEntity }}</pre>
      </div>
    </aside>
    <div class="grid" @contextmenu.prevent="resetSelected">
      <template v-for="row in gameState.map.rows">
        <div
          v-for="cell in row"
          :key="`${cell.x}:${cell.y}`"
          :style="{ '--x': cell.x + 1, '--y': cell.y + 1 }"
          :class="['cell', { 'is-highlighted': isHighlighted(cell) }]"
          @click="onCellClick(cell)"
        >
          <EntityView.reuse
            v-if="getEntityAt(gameState, cell)"
            :entity="getEntityAt(gameState, cell)!"
          />
        </div>
      </template>
    </div>

    <aside class="event-logs-sidebar">
      <h2>Event Logs</h2>
      <!-- <TransitionGroup tag="div" name="log" class="event-logs"> -->
      <p v-for="(event, index) in logs" :key="index">
        {{ event }}
      </p>
      <div ref="logSentinel" key="sentinel" />
      <!-- </TransitionGroup> -->
    </aside>

    <footer class="flex gap-5 align-start">
      <section class="flex gap-2">
        <h3>Summon</h3>
        <UiButton
          v-for="summon in availableSummons"
          :key="summon.characterId"
          :disabled="!canSummon(summon)"
          @click="selectSummon(summon)"
        >
          {{ summon.name }} ({{ summon.cost }}AP)
        </UiButton>
      </section>

      <section class="flex gap-2">
        <h3>Abilities</h3>
        <UiButton
          v-for="skill in activeSkills"
          :key="skill.id"
          :disabled="!canCast(skill)"
          @click="selectSkill(skill)"
        >
          {{ skill.name }} ({{ skill.cost }}AP)
        </UiButton>
      </section>

      <UiButton :theme="{ bg: 'red-9', hoverBg: 'red-7' }" @click="endTurnAction">
        End Turn
      </UiButton>
    </footer>
  </main>
</template>

<style scoped lang="postcss">
main {
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr max-content 1fr;
  grid-template-rows: 1fr auto;
  gap: var(--size-3);

  padding: 0;
  padding-inline: var(--size-4);
}

h2 {
  font-size: var(--font-size-5);
}

h3 {
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-4);
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
  overflow-x: hidden;
}
.grid {
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(v-bind('gameState.map.width'), 64px);
  grid-template-rows: repeat(v-bind('gameState.map.height'), 64px);
  align-self: center;

  max-width: calc(64px * v-bind('gameState.map.width'));
}

.cell {
  overflow: hidden;
  border: solid 1px var(--primary);

  &:has(.is-active) {
    z-index: 1;
    outline: solid 2px yellow;
    outline-offset: 1px;
  }
  &.is-highlighted {
    background-color: hsl(var(--color-primary-hover-hsl) / 0.35);
  }
}

.entity {
  cursor: pointer;
  user-select: none;

  position: relative;

  display: grid;
  grid-column: var(--x);
  grid-row: var(--y);
  place-content: center;

  width: 100%;
  height: 100%;

  font-family: monospace;
  font-size: 0.7rem;
  color: var(--gray-1);
  text-align: center;

  background-color: var(--color);

  &:not(.general) .icon {
    display: none;
  }

  .icon {
    position: absolute;
    top: calc(-1 * var(--size-1));
    left: 0;

    width: 1.5em !important;
    height: 1.5em !important;
  }
}

.atb-bar {
  position: absolute;
  bottom: 0;
  transform-origin: center left;
  transform: scaleX(calc(1% * var(--filled)));

  width: 100%;
  height: 5px;

  background-color: var(--blue-7);

  transition: transform 0.3s;
}
.hp-bar {
  position: absolute;
  bottom: 6px;

  width: 100%;
  height: 5px;

  background-color: var(--red-7);

  &::after {
    content: '';

    position: absolute;
    inset: 0;
    transform-origin: center left;
    transform: scaleX(calc(1% * var(--filled)));

    background-color: var(--green-4);

    transition: transform 0.3s;
  }
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

footer {
  grid-column: 2;
}
</style>
