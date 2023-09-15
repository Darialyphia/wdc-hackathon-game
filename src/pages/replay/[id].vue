<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../api';
import type { GameDetail } from '../../composables/game/useGame';

definePage({
  name: 'Replay'
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

const { mutate: surrender } = useMutation(api.games.surrender);

// syntax highlighting doesn't like type assertions in template
const gameInfo = computed(() => game.value as GameDetail);
</script>

<template>
  <main ref="root">
    <Query v-slot="{ data: me }" :query="api => api.users.me" :args="{}">
      <div v-if="game === undefined" class="loader">
        <UiSpinner size="xl" />
        Loading game...
      </div>

      <div v-else-if="game === null">Game not found</div>

      <div v-else-if="game.state !== 'ENDED'">
        you cannot replay a game that is still ongoing
      </div>

      <GameClient
        v-if="game && width && height && me"
        :me="me?._id"
        :game="gameInfo"
        :width="width"
        :height="height"
        is-replay
        @surrender="surrender({ gameId: game._id })"
      />
      <div v-else>
        {{ { game, width, height, me } }}
      </div>
    </Query>
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
