<script setup lang="ts">
import type { Id } from '../../convex/_generated/dataModel';
import { useFloating, offset } from '@floating-ui/vue';

const { gameId } = defineProps<{
  gameId: Id<'games'>;
}>();

const router = useRouter();
const href = router.resolve({ name: 'Replay', params: { id: gameId } }).href;
const source = ref(`${location.origin}${href}`);

const { copy, isSupported } = useClipboard({ source });

const isTooltipDisplayed = ref(false);

const buttonEl = ref<HTMLElement>();
const floatingEl = ref<HTMLElement>();

const { x, y, strategy } = useFloating(buttonEl, floatingEl, {
  placement: 'bottom',
  middleware: [offset(5)]
});

const showTooltip = async () => {
  await copy();
  isTooltipDisplayed.value = true;
  setTimeout(() => {
    isTooltipDisplayed.value = false;
  }, 2500);
};
</script>

<template>
  <UiGhostButton
    ref="buttonEl"
    left-icon="mdi:clipboard-multiple-outline"
    @click="showTooltip"
  >
    Share
  </UiGhostButton>

  <div v-if="isTooltipDisplayed" ref="floatingEl" class="surface tooltip">
    Replay URL copied !
  </div>
</template>

<style scoped lang="postcss">
.tooltip {
  position: v-bind(strategy);
  z-index: 1;
  top: v-bind('`${y ?? 0}px`');
  left: v-bind('`${x ?? 0}px`');

  padding: var(--size-1);

  font-size: var(--font-size-0);

  border: solid var(--border-size-1) var(--border-dimmed);

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.3s;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
}
</style>
