<script setup lang="ts">
import { api } from '../../convex/_generated/api';
import { generals } from '../resources/generals';

definePage({
  name: 'Home'
});

const { mutate: createGame, isLoading } = useMutation(api.games.create);

const generalId = ref<string>();
const { push } = useRouter();
const onSubmit = async () => {
  if (!generalId.value) return;

  const gameId = await createGame({ generalId: generalId.value });
  push({ name: 'Game', params: { id: gameId } });
};

const me = await useSuspenseQuery(api.users.me, []);
const games = await useSuspenseQuery(api.games.getList, []);

const canJoin = computed(
  () => !games.value.some(game => game.creator?._id === me.value?._id)
);
</script>

<template>
  <main>
    <section class="container surface">
      <h2>Games</h2>
      <article v-for="game in games" :key="game._id">
        <h3>{{ game.creator?.name }}'s game</h3>
        {{ game.state }}
        <UiButton v-if="canJoin && game.creator?._id === me?._id">Join</UiButton>
      </article>
    </section>

    <section class="container surface">
      <h2>Create new game</h2>
      <form @submit.prevent="onSubmit">
        <fieldset>
          <legend>Choose your general</legend>
          <label v-for="general in generals" :key="general.characterId" class="block">
            <input v-model="generalId" type="radio" :value="general.characterId" />
            {{ general.name }}
          </label>
        </fieldset>
        <UiButton :is-loading="isLoading">Create game</UiButton>
      </form>
    </section>
  </main>
</template>

<style scoped>
h2 {
  font-size: var(--font-size-5);
}

article h3 {
  font-size: var(--font-size-3);
}
</style>
