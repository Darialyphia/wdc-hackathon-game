<script setup lang="ts">
import { subject } from '@casl/ability';
import { createPlayerAbility } from '../../../sdk/abilities/player.ability';
import type { SoldierData } from '../../../sdk/soldiers';
import type { SkillData } from '../../../sdk/utils/entityData';

const {
  activeEntity,
  selectedSummon,
  selectedSkill,
  endTurn,
  state,
  me,
  targetMode,
  canCast
} = useGame();

const availableSummons = computed(() => {
  if (activeEntity.value.kind !== 'general') return [];

  return activeEntity.value.blueprint.summonBlueprints;
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
  <div v-if="activeEntity.owner === me" class="action-bar fancy-surface" @mousemove.stop>
    <button
      v-for="skill in activeEntity.blueprint.skills"
      :key="skill.id"
      :title="`use ${skill.name}`"
      class="skill"
      :class="targetMode === 'skill' && 'active'"
      :data-cost="skill.cost"
      :disabled="!canCast(skill)"
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

<style scoped lang="postcss">
.action-bar {
  display: flex;
  gap: var(--size-4);
  align-items: center;

  min-width: var(--size-sm);
  padding: var(--size-3);

  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
}

:is(.skill, .summon) {
  position: relative;

  aspect-ratio: 1;

  background-repeat: no-repeat;
  background-size: cover;
  border: solid 2px var(--primary);
  &::after {
    content: attr(data-cost);

    position: absolute;
    right: -12px;
    bottom: -7px;

    display: grid;
    place-content: center;

    aspect-ratio: 1;
    width: 3ch;

    background: var(--fancy-bg);
    background-blend-mode: overlay;
    border: var(--fancy-border);
    border-radius: var(--radius-round);
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
  }
}

.skill {
  width: 64px;
  border-radius: 4px;
}

.summon {
  border-radius: var(--radius-round);
}

.end-turn {
  margin-left: auto;
}
</style>
../../sdk/soldiers ../../resources/entityData
