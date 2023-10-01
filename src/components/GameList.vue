<script setup lang="ts">
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { CharacterId } from '../sdk/entity';
import type { Nullable } from '../utils/types';

const { push } = useRouter();
const me = await useSuspenseQuery(api.users.me, []);
const games = await useSuspenseQuery(api.games.getList, []);
const currentGame = useQuery(api.games.currentGame, []);

const isChooseGeneralModalOpened = ref(false);
const selectedGameId = ref<Nullable<Id<'games'>>>();
watchEffect(() => {
  if (!isChooseGeneralModalOpened.value) {
    selectedGameId.value = null;
  }
});

const canJoin = computed(
  () => me.value && !games.value.some(game => game.creator?._id === me.value?._id)
);

const { mutate: cancel, isLoading: isCancelling } = useMutation(api.games.cancel);

const { mutate: createGame, isLoading: isCreating } = useMutation(api.games.create);
const onCreate = async (general: CharacterId) => {
  const gameId = await createGame({ generalId: general });
  isChooseGeneralModalOpened.value = false;
  push({ name: 'Game', params: { id: gameId } });
};

const { mutate: joinGame, isLoading: isJoining } = useMutation(api.games.join);
const onJoin = async (general: CharacterId) => {
  const gameId = await joinGame({ generalId: general, gameId: selectedGameId.value! });
  isChooseGeneralModalOpened.value = false;
  push({ name: 'Game', params: { id: gameId } });
};

const onTryJoin = (id: Id<'games'>) => {
  selectedGameId.value = id;
  isChooseGeneralModalOpened.value = true;
};
</script>

<template>
  <div class="grid gap-3">
    <p v-if="games.length === 0">There are not ongoing game at the moment.</p>
    <article v-for="game in games" :key="game._id" class="fancy-surface">
      <h3>{{ game.creator?.name }}'s game</h3>
      <span class="ml-auto">{{ game.state }}</span>
      <UiButton
        v-if="canJoin && game.state === 'WAITING_FOR_OPPONENT'"
        left-icon="game-icons:crossed-swords"
        @click="onTryJoin(game._id)"
      >
        Join
      </UiButton>
      <RouterLink
        v-if="game.state === 'ONGOING' && !currentGame"
        v-slot="{ href, navigate }"
        custom
        :to="{ name: 'Game', params: { id: game._id } }"
      >
        <UiButton :href="href" left-icon="game-icons:angry-eyes" @click="navigate">
          Spectate
        </UiButton>
      </RouterLink>
      <UiButton
        v-if="game.creator?._id === me?._id && game.state === 'WAITING_FOR_OPPONENT'"
        left-icon="material-symbols:close-rounded"
        :is-loading="isCancelling"
        :theme="{ bg: 'red-6', hoverBg: 'red-7' }"
        @click="cancel({ gameId: game._id })"
      >
        Cancel
      </UiButton>
    </article>

    <UiButton
      v-if="me"
      left-icon="material-symbols:add-circle-outline"
      :theme="{ size: 'size-3' }"
      @click="isChooseGeneralModalOpened = true"
    >
      New Game
    </UiButton>
  </div>

  <ChooseGeneralModal
    v-model:is-opened="isChooseGeneralModalOpened"
    :is-loading="isCreating || isJoining"
    @submit="selectedGameId ? onJoin($event) : onCreate($event)"
  />
</template>

<style scoped>
h2 {
  font-size: var(--font-size-5);
}

article {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  padding: var(--size-3);

  border: solid var(--border-size-1) var(--primary);

  h3 {
    font-size: var(--font-size-3);
  }
}
</style>
