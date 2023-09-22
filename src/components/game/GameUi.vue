<script setup lang="ts">
import { api } from '../../api';

const { game, state, selectedEntity, atbTimeline, surrender } = useGame();

const players = computed(() =>
  game.value.players.map(player => ({
    ...player,
    general: state.value.entities.find(
      e => e.kind === 'general' && e.owner === player.userId
    )
  }))
);

const { mutate: postMessage } = useMutation(api.games.postMessageToGame);
const text = ref('');
const onSubmit = async () => {
  await postMessage({ gameId: game.value._id, text: text.value });
  text.value = '';
};

const isChatDisplayed = ref(false);
</script>

<template>
  <PlayersUi />
  <AtbTimeline />

  <Transition>
    <EntityCard v-if="selectedEntity" :entity="selectedEntity" class="selected-entity" />
  </Transition>

  <GameActionBar class="game-action-bar" />
  <GameChat />

  <UiIconButton
    icon="ic:sharp-emoji-flags"
    :theme="{ size: 'font-size-5' }"
    title="Surrender"
    class="surrender-button"
    @click="surrender"
  />
</template>

<style scoped>
.selected-entity {
  position: absolute;
  top: 14rem;
  left: var(--size-5);

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateX(-50%);
    opacity: 0;
  }
}
</style>
