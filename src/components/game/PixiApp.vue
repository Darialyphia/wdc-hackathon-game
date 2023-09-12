<script setup lang="ts">
import '../../utils/pixi-custom-elements';
import type { Doc, Id } from '../../../convex/_generated/dataModel';
import type { Action } from '../../composables/game/useGame';
import { Application, Assets, BaseTexture, SCALE_MODES, extensions } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import { assetsManifest } from '../../assets/manifest';
import { WRAP_MODES } from 'pixi.js';

import GameContainer from './GameContainer.vue';

const { game, width, height, me } = defineProps<{
  game: Omit<Doc<'games'>, 'creator'> & { events: Doc<'gameEvents'>[] } & {
    players: Doc<'gamePlayers'>[];
  };
  width: number;
  height: number;
  me: Id<'users'>;
}>();

const emit = defineEmits<{
  action: [Action];
}>();

const canvas = ref<HTMLCanvasElement>();

const gameState = useGameProvider(
  computed(() => game),
  arg => emit('action', arg),
  me
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

const players = computed(() =>
  game.players.map(player => ({
    ...player,
    general: gameState.state.value.entities.find(
      e => e.kind === 'general' && e.owner === player.userId
    )
  }))
);
</script>

<template>
  <div class="game-client-container" @contextmenu.prevent>
    <canvas ref="canvas" />

    <div class="player-1">
      <div>{{ players[0].general?.blueprint.name }}</div>
      <div>{{ players[0].general?.hp }} / {{ players[0].general?.blueprint.maxHp }}</div>
    </div>

    <div class="player-2">
      <div>{{ players[1].general?.blueprint.name }}</div>
      <div>{{ players[1].general?.hp }} / {{ players[1].general?.blueprint.maxHp }}</div>
    </div>

    <GameActionBar class="game-action-bar" />
  </div>
</template>

<style scoped>
.game-client-container {
  position: relative;

  width: v-bind(width);
  height: v-bind(height);

  font-family: monospace;
  font-size: monospace;
}

.player-1 {
  position: absolute;
  top: var(--size-5);
  left: var(--size-5);
}
.player-2 {
  position: absolute;
  top: var(--size-5);
  right: var(--size-5);
  text-align: right;
}

.game-action-bar {
  position: absolute;
  bottom: var(--size-5);
  left: 50%;
  transform: translateX(-50%);
}
</style>
