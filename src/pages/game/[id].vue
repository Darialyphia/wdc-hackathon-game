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
  <UiCenter v-if="game === undefined">
    <UiSpinner size="xl" />
  </UiCenter>

  <pre>{{ game }}</pre>
</template>
