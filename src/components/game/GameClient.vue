<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel';
import type { Action, GameDetail } from '../../composables/game/useGame';
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import PixiRenderer from './PixiRenderer.vue';
import PixiPlugin from 'gsap/PixiPlugin';
import { Stage } from '@pixi/layers';

import cursorUrl from '../../assets/ui/cursor.png';
import cursorDisabledUrl from '../../assets/ui/cursor_disabled.png';
import cursorAttackUrl from '../../assets/ui/cursor_attack.png';
import cursorMoveUrl from '../../assets/ui/cursor_move.png';
import cursorSummonUrl from '../../assets/ui/cursor_summon.png';

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
window.gsap.registerPlugin(PixiPlugin);

const {
  game,
  width,
  height,
  me,
  isReplay = false
} = defineProps<{
  game: GameDetail;
  width: number;
  height: number;
  me?: Id<'users'>;
  isReplay?: boolean;
}>();

const emit = defineEmits<{
  action: [Action];
  surrender: [];
}>();

const canvas = ref<HTMLCanvasElement>();

const assets = useAssetsProvider();
const sequencer = useFXSequencerProvider(assets);

const replayStep = ref(0);

const isPlaying = ref(false);
watch(isPlaying, newValue => {
  if (newValue) replayStep.value++;
});

const gameState = isReplay
  ? useReplayProvider(
      computed(() => game),
      arg => emit('action', arg),
      sequencer,
      replayStep,
      isPlaying
    )
  : useGameProvider(
      computed(() => game),
      arg => emit('action', arg),
      () => emit('surrender'),
      me,
      sequencer
    );

const screenMap = useScreenMapProvider(gameState);

const cursors = {
  default: `url('${cursorUrl}'), auto`,
  disabled: `url('${cursorDisabledUrl}'), auto`,
  attack: `url('${cursorAttackUrl}'), auto`,
  move: `url('${cursorMoveUrl}'), auto`,
  summon: `url('${cursorSummonUrl}'), auto`
};

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

  pixiApp.stage = new Stage();
  pixiApp.renderer.events.cursorStyles = cursors;

  if (import.meta.env.DEV) {
    // @ts-ignore  enable PIXI devtools
    window.__PIXI_APP__ = pixiApp;
  }
  gsap.registerPlugin(PixiPlugin);
  gsap.install(window);

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(PixiRenderer);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, gameState);
  app.provide(SCREEN_MAP_INJECTION_KEY, screenMap);
  app.provide(FX_SEQUENCER_INJECTION_KEY, sequencer);
  app.provide(ASSETS_INJECTION_KEY, assets);
  assets.load().then(() => {
    app.mount(pixiApp.stage);
  });
});

const resetTargetMode = () => {
  setTimeout(() => {
    gameState.targetMode.value = null;
  });
};
</script>

<template>
  <div class="game-client-container" @contextmenu.prevent @pointerup="resetTargetMode">
    <canvas ref="canvas" />

    <ReplayUi v-if="isReplay" />
    <GameUi v-else />
  </div>
</template>

<style lang="postcss">
.game-client-container {
  --primary: var(--yellow-2);
  --color-primary-hsl: var(--yellow-2-hsl);
  --ui-ghost-button-color-hsl: var(--color-primary-hsl);

  --link: var(--primary);

  cursor: v-bind('cursors.default');
  user-select: none;

  position: relative;

  width: v-bind(width);
  height: v-bind(height);

  font-family: monospace;
  color: var(--gray-0);

  :where(
      :not(canvas),
      a[href],
      area,
      button,
      input:not(
          [type='text'],
          [type='email'],
          [type='number'],
          [type='password'],
          [type=''],
          [type='tel'],
          [type='url']
        ),
      label[for],
      select,
      summary,
      [tabindex]:not([tabindex*='-'])
    ) {
    cursor: inherit !important;

    &:disabled {
      cursor: v-bind('cursors.disabled') !important;
    }
  }
}

.game-action-bar {
  position: absolute;
  bottom: var(--size-5);
  left: 50%;
  transform: translateX(-50%);
}

.surrender-button {
  position: absolute;
  right: var(--size-4);
  bottom: var(--size-4);
}

.replay-controls {
  position: absolute;
  bottom: var(--size-7);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-4);

  padding: var(--size-2);

  background-color: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
}
</style>
