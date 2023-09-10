<script setup lang="ts">
import { api } from '../api';

const { push } = useRouter();
const currentGame = useQuery(api.games.currentGame, []);

const { mutate: confirm, isLoading } = useMutation(api.games.confirm);

const onConfirm = async () => {
  if (!currentGame.value) return;

  await confirm({ gameId: currentGame.value?._id });
  push({ name: 'Game', params: { id: currentGame.value._id } });
};
</script>

<template>
  <UiModal
    id="confirm-game"
    :is-opened="currentGame?.state === 'WAITING_FOR_CREATOR_CONFIRMATION'"
    :is-closable="false"
  >
    <UiModalContent>
      <div class="flex flex-col items-center gap-4 text-center pt-4">
        <h2>Get ready for the battle !</h2>
        <p>An opponent has been found !</p>
        <UiButton :is-loading="isLoading" @click="onConfirm">Confirm</UiButton>
      </div>

      <div class="progress" />
    </UiModalContent>
  </UiModal>
</template>

<style scoped lang="postcss">
@keyframes confirm-countdown {
  from {
    transform: scaleX(1);
    background-color: hsl(80, 70%, 45%);
  }
  to {
    transform: scaleX(0);
    background-color: hsl(0, 70%, 55%);
  }
}
.progress {
  transform-origin: center left;

  width: 100%;
  height: var(--size-5);
  margin-block-start: var(--size-6);

  border: solid 1px var(--text-1);

  animation: confirm-countdown 15s linear forwards;
}
</style>
