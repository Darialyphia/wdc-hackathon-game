<script setup lang="ts">
import '../../utils/pixi-custom-elements';
import type { Doc } from '../../../convex/_generated/dataModel';
import type { Action } from '../../composables/game/useGame';
import { Application, Assets, BaseTexture, SCALE_MODES, extensions } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import { assetsManifest } from '../../assets/manifest';
import { WRAP_MODES } from 'pixi.js';

import GameContainer from './GameContainer.vue';

const { game, width, height } = defineProps<{
  game: Omit<Doc<'games'>, 'creator'> & { events: Doc<'gameEvents'>[] } & {
    players: Doc<'gamePlayers'>[];
  };
  width: number;
  height: number;
}>();

const emit = defineEmits<{
  action: [Action];
}>();

const canvas = ref<HTMLCanvasElement>();

const gameState = useGameProvider(
  computed(() => game),
  arg => emit('action', arg)
);

onMounted(() => {
  // We create the pixi app manually instead of using vue3-pixi's <Application /> component
  // because we want to be able to provide a bunch of stuff so we need access to the underlying vue-pixi app
  // and we can forward the providers to it
  const pixiApp = new Application({
    view: canvas.value,
    width: width,
    height: height,
    autoDensity: true,
    antialias: false
  });

  if (import.meta.env.DEV) {
    // @ts-ignore  enable PIXI devtools
    window.__PIXI_APP__ = pixiApp;
  }

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
  extensions.add(spriteSheetParser);
  Assets.init({ manifest: assetsManifest });

  const app = createApp(GameContainer);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, gameState);

  app.mount(pixiApp.stage);
});
</script>

<template>
  <div class="game-client-container" @contextmenu.prevent>
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.game-client-container {
  width: v-bind(width);
  height: v-bind(height);
  font-family: monospace;
}
</style>
../../composables/game/useGame
