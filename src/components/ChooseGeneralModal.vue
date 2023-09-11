<script setup lang="ts">
import type { CharacterId } from '../game-logic/entity';
import { generals } from '../resources/generals';

const { isLoading } = defineProps<{ isLoading: boolean }>();
const isOpened = defineModel('isOpened', { required: true });
const emit = defineEmits<{
  submit: [CharacterId];
}>();

const generalId = ref<CharacterId>();
</script>

<template>
  <UiModal id="create-game" v-model:is-opened="isOpened">
    <UiModalHeader>Choose your general</UiModalHeader>

    <UiModalContent>
      <form class="spacey-4" @submit.prevent="emit('submit', generalId!)">
        <fieldset>
          <label
            v-for="general in generals"
            :key="general.characterId"
            :class="['block', generalId === general.characterId && 'is-selected']"
          >
            <input
              v-model="generalId"
              type="radio"
              :value="general.characterId"
              class="sr-only"
            />
            {{ general.name }}
          </label>
        </fieldset>
        <UiButton class="mx-auto" :is-loading="isLoading" :disabled="!generalId">
          Continue
        </UiButton>
      </form>
    </UiModalContent>
  </UiModal>
</template>

<style scoped>
fieldset {
  display: flex;
  gap: var(--size-3);
}

label {
  cursor: pointer;

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: var(--size-12);
  &:hover,
  &:focus-within {
    outline-color: var(--link);
    outline-style: solid;
    outline-offset: 2px;
    transition: outline-offset 145ms var(--ease-2);
  }

  &.is-selected {
    background-color: var(--primary);
  }
}
</style>
