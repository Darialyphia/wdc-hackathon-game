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
</script>

<template>
  <div v-if="game === undefined" class="loader">
    <UiSpinner size="xl" />
    Loading game...
  </div>

  <GameScreen v-if="game?.state === 'ONGOING'" :game="game" />

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
    {{ game.creator?.name }} declined the challenge or did not respond in time.
  </div>

  <div v-else-if="game?.state === 'ENDED'" class="grid place-content-center">
    The game has ended
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  gap: var(--size-7);
  align-items: center;
  justify-content: center;

  font-size: var(--font-size-4);
}
</style>
