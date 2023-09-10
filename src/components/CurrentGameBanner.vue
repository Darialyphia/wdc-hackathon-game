<script setup lang="ts">
import { api } from '../api';

const route = useRoute();
const currentGame = await useSuspenseQuery(api.games.currentGame, []);

const isOnGameRoute = computed(() => {
  return route.name === 'Game' && route.params.id === currentGame.value?._id;
});
</script>

<template>
  <Transition>
    <div v-if="currentGame && !isOnGameRoute" class="current-game-banner" role="alert">
      <div class="container flex gap-3 items-center">
        Seems like you have an ongoing game !
        <RouterLink
          v-slot="{ href, navigate }"
          custom
          :to="{ name: 'Game', params: { id: currentGame._id } }"
        >
          <UiButton
            :href="href"
            :theme="{ bg: 'cyan-5', hoverBg: 'cyan-7' }"
            @click="navigate"
          >
            Let's kick some ass
          </UiButton>
        </RouterLink>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.current-game-banner {
  padding: var(--size-3);
  color: var(--text-on-primary);
  background-color: var(--primary);
}

.v-enter-active,
.v-leave-active {
  transition: all 0.3s;
}

.v-enter-from,
.v-leave-to {
  transform: translateY(calc(-1 * var(--size-4)));
  opacity: 0;
}
</style>
