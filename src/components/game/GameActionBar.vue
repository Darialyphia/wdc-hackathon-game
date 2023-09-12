<script setup lang="ts">
import { subject } from '@casl/ability';
import { createPlayerAbility } from '../../game-logic/abilities/player.ability';
import { getSummonBlueprints } from '../../game-logic/utils/entity.helpers';
import type { SoldierData } from '../../resources/soldiers';
import { getSkillById } from '../../game-logic/utils/skill.helper';

const { activeEntity, selectedSummon, selectedSkill, state, me } = useGame();

const availableSummons = computed(() => {
  if (activeEntity.value.kind !== 'general') return [];

  return Object.values(getSummonBlueprints(activeEntity.value));
});

const canSummon = (blueprint: SoldierData) => {
  const ability = createPlayerAbility(state.value, activeEntity.value.owner);
  return ability.can('summon', subject('soldier', blueprint));
};
</script>

<template>
  <div v-if="activeEntity.owner === me" class="flex gap-4 action-bar">
    <button
      v-for="skill in activeEntity.blueprint.skills"
      :key="skill"
      :title="`user ${getSkillById(skill)!.name}`"
      :theme="{ size: 'size-8' }"
      class="skill"
      @click="selectedSkill = getSkillById(skill)"
    >
      <img :src="getSkillById(skill)!.iconUrl" />
    </button>

    <button
      v-for="summon in availableSummons"
      :key="summon.characterId"
      :disabled="!canSummon(summon)"
      :title="`Summon ${summon.name}`"
      @click="selectedSummon = summon"
    >
      <img :src="summon.iconUrl" />
    </button>
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
button {
  aspect-ratio: 1;
  border: solid 2px var(--primary);
  border-radius: 4px;
  img {
    width: 48px;
    height: auto;
    object-fit: none;
    image-rendering: pixelated;
  }
}
</style>
