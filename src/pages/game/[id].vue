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
  <div v-if="game === undefined" class="grid place-content-center">
    <UiSpinner size="xl" />
  </div>

  <GameScreen v-if="game?.state === 'ONGOING'" :game="game" />
  <div
    v-else-if="game?.state === 'WAITING_FOR_CREATOR_CONFIRMATION'"
    class="grid place-content-center"
  >
    Waiting for opponent confirmation...
  </div>
  <div
    v-else-if="game?.state === 'WAITING_FOR_OPPONENT'"
    class="grid place-content-center"
  >
    Waiting for opponent...
  </div>
</template>
