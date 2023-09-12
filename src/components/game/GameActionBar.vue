<script setup lang="ts">
import { getSkillById } from '../../game-logic/utils/skill.helper';

const { activeEntity } = useGame();
</script>

<template>
  <div class="flex gap-4">
    <UiIconButton
      v-for="skill in activeEntity.blueprint.skills"
      :key="skill"
      :icon="getSkillById(skill)!.icon"
      :title="skill"
      :theme="{ size: 'size-8' }"
      class="skill"
    />
  </div>
</template>

<style scoped>
.skill:hover {
  --ui-button-base-color: var(--primary);
}
</style>
