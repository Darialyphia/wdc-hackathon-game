<script setup lang="ts">
import { subject } from '@casl/ability';
import { createPlayerAbility } from '../../game-logic/abilities/player.ability';
import { getSummonBlueprints } from '../../game-logic/utils/entity.helpers';
import type { SoldierData } from '../../resources/soldiers';
import type { SkillData } from '../../resources/entity';

const { activeEntity, selectedSummon, selectedSkill, endTurn, state, me, targetMode } =
  useGame();

const availableSummons = computed(() => {
  if (activeEntity.value.kind !== 'general') return [];

  return Object.values(getSummonBlueprints(activeEntity.value));
});

const canSummon = (blueprint: SoldierData) => {
  const ability = createPlayerAbility(state.value, activeEntity.value.owner);
  return ability.can('summon', subject('soldier', blueprint));
};

const onSkillPointerdown = (skill: SkillData) => {
  selectedSkill.value = skill;
  targetMode.value = 'skill';
};

const onSummonPointerdown = (summon: SoldierData) => {
  selectedSummon.value = summon;
  targetMode.value = 'summon';
};
</script>

<template>
  <div v-if="activeEntity.owner === me" class="flex items-center gap-4 action-bar">
    <button
      v-for="skill in activeEntity.blueprint.skills"
      :key="skill.id"
      :title="`use ${skill.name}`"
      class="skill"
      :class="targetMode === 'skill' && 'active'"
      :data-cost="skill.cost"
      :disabled="activeEntity.ap < skill.cost"
      :style="{ backgroundImage: `url(${skill.iconUrl})` }"
      @pointerdown="onSkillPointerdown(skill)"
    />

    <button
      v-for="summon in availableSummons"
      :key="summon.characterId"
      :disabled="!canSummon(summon)"
      :title="`Summon ${summon.name}`"
      class="summon"
      :class="targetMode === 'summon' && 'active'"
      :data-cost="summon.cost"
      @pointerdown="onSummonPointerdown(summon)"
    >
      <img :src="summon.iconUrl" draggable="false" />
    </button>

    <UiButton
      :theme="{ bg: 'red-9', hoverBg: 'red-7', color: 'gray-0', hoverColor: 'gray-0' }"
      class="end-turn"
      @click="endTurn"
    >
      End Turn
    </UiButton>
  </div>
</template>

<style scoped>
.action-bar {
  min-width: var(--size-sm);
  padding: var(--size-3);

  background-color: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
}

.skill {
  width: 64px;
}
.skill,
.summon {
  position: relative;

  aspect-ratio: 1;

  background-repeat: no-repeat;
  background-size: cover;
  border: solid 2px var(--primary);
  border-radius: 4px;
  &::after {
    content: attr(data-cost);

    position: absolute;
    top: calc(100% - var(--size-3));
    right: calc(-1 * var(--size-3));

    aspect-ratio: 1;
    width: var(--size-6);
    padding: var(--size-1);

    background-color: black;
    border: solid 2px var(--primary);
    border-radius: var(--radius-round);
    outline: solid 5px black;
  }

  &:hover,
  &.active {
    filter: brightness(125%);
    box-shadow: 0 0 8px 2px var(--primary);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 75%;
    filter: grayscale(75%);
  }

  img {
    width: 48px;
    height: auto;
    object-fit: none;
    image-rendering: pixelated;
  }
}

.end-turn {
  margin-left: auto;
}
</style>
