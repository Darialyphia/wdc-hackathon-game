<script setup lang="ts">
import { api } from '../../convex/_generated/api';
import { generals } from '../resources/generals';

definePage({
  name: 'Home'
});

const { mutate: createGame, isLoading } = useMutation(api.games.create);

const generalId = ref<string>();

const onSubmit = () => {
  if (!generalId.value) return;

  createGame({ generalId: generalId.value });
};
</script>

<template>
  <main>
    <form @submit.prevent="onSubmit">
      <label v-for="general in generals" :key="general.characterId">
        <input v-model="generalId" type="radio" :value="general.characterId" />
        {{ general.name }}
      </label>
      <UiButton :is-loading="isLoading">Create game</UiButton>
    </form>
  </main>
</template>
