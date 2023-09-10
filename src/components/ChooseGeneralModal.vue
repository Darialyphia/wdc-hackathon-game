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
      <form @submit.prevent="emit('submit', generalId!)">
        <fieldset>
          <label v-for="general in generals" :key="general.characterId" class="block">
            <input v-model="generalId" type="radio" :value="general.characterId" />
            {{ general.name }}
          </label>
        </fieldset>
        <UiButton :is-loading="isLoading" :disabled="!generalId">Continue</UiButton>
      </form>
    </UiModalContent>
  </UiModal>
</template>
