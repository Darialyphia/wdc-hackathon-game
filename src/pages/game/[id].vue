<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../api';

definePage({
  name: 'Game'
});
const route = useRoute('Game');
const { push } = useRouter();

const game = useQuery(api.games.getById, () => [
  { gameId: route.params.id as Id<'games'> }
]);

watchEffect(() => {
  if (game.value === null) {
    push({ name: 'Home' });
  }
});

const root = ref<HTMLElement>();
const { width, height } = useElementBounding(root);
</script>

<template>
  <main ref="root">
    <div v-if="game === undefined" class="loader">
      <UiSpinner size="xl" />
      Loading game...
    </div>

    <PixiApp
      v-if="game?.state === 'ONGOING' && width && height"
      :game="game"
      :width="width"
      :height="height"
    />

    <div v-else-if="game?.state === 'WAITING_FOR_CREATOR_CONFIRMATION'" class="loader">
      <UiSpinner size="xl" />

      Waiting for opponent confirmation...
    </div>

    <div v-else-if="game?.state === 'WAITING_FOR_OPPONENT'" class="loader">
      <UiSpinner size="xl" />

      Waiting for opponent...
    </div>

    <div
      v-else-if="game?.state === 'DECLINED_BY_CREATOR'"
      class="grid place-content-center"
    >
      You declined the challenge or did not respond in time.
    </div>

    <div v-else-if="game?.state === 'ENDED'" class="grid place-content-center">
      The game has ended
    </div>
  </main>
</template>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  gap: var(--size-7);
  align-items: center;
  justify-content: center;

  height: 100%;

  font-size: var(--font-size-4);
}
</style>
