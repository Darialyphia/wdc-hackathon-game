<script setup lang="ts">
import '../../utils/pixi-custom-elements';
import type { Id } from '../../../convex/_generated/dataModel';
import type { Action, GameDetail } from '../../composables/game/useGame';
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import PixiRenderer from './PixiRenderer.vue';
import { api } from '../../api';

import PixiPlugin from 'gsap/PixiPlugin';

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
      me,
      sequencer
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
  gsap.registerPlugin(PixiPlugin);
  gsap.install(window);

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(PixiRenderer);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, gameState);
  app.provide(FX_SEQUENCER_INJECTION_KEY, sequencer);
  app.provide(ASSETS_INJECTION_KEY, assets);
  assets.load().then(() => {
    app.mount(pixiApp.stage);
  });
});

const players = computed(() =>
  game.players.map(player => ({
    ...player,
    general: gameState.state.value.entities.find(
      e => e.kind === 'general' && e.owner === player.userId
    )
  }))
);

const selectedEntity = computed(() => gameState.selectedEntity.value);

const resetTargetMode = () => {
  setTimeout(() => {
    gameState.targetMode.value = null;
  });
};

const { mutate: postMessage } = useMutation(api.games.postMessageToGame);
const text = ref('');
const onSubmit = async () => {
  await postMessage({ gameId: game._id, text: text.value });
  text.value = '';
};

const isChatDisplayed = ref(false);
</script>

<template>
  <div class="game-client-container" @contextmenu.prevent @pointerup="resetTargetMode">
    <canvas ref="canvas" />

    <div class="player-1">
      <img :src="players[0].general?.blueprint.iconUrl" />
      <div class="player-name">{{ players[0].user.name }}</div>

      <div class="hp">
        <div class="i-game-icons:health-normal" />
        {{ players[0].general?.hp.toFixed() }}
      </div>
    </div>

    <div class="player-2">
      <img :src="players[1].general?.blueprint.iconUrl" />
      <div class="player-name">{{ players[1].user.name }}</div>

      <div class="hp">
        <div class="i-game-icons:health-normal" />
        {{ players[1].general?.hp.toFixed() }}
      </div>
    </div>

    <div class="timeline">
      <div>
        <div
          class="global-atb"
          :style="{ '--percent': gameState.state.value.globalAtb }"
        />
        Turn&nbsp;{{ gameState.state.value.turn }}
      </div>
      <button
        v-for="(entity, index) in gameState.atbTimeline.value"
        :key="index"
        style="appearance: none"
        @click="gameState.selectedEntity.value = entity"
      >
        <img :src="entity.blueprint.iconUrl" />
      </button>
    </div>

    <Transition>
      <div v-if="selectedEntity" class="selected-entity">
        <img :src="selectedEntity.blueprint.iconUrl" />
        {{ selectedEntity.blueprint.name }}
        <br />
        Hp: {{ selectedEntity.hp }} / {{ selectedEntity.blueprint.maxHp }}
        <br />
        Atk:
        <span
          class="stat"
          :class="{
            'is-buffed': selectedEntity.attack > selectedEntity.blueprint.attack,
            'is-debuffed': selectedEntity.attack < selectedEntity.blueprint.attack
          }"
        >
          {{ selectedEntity.attack }}
        </span>
        <br />
        Def:
        <span
          class="stat"
          :class="{
            'is-buffed': selectedEntity.defense > selectedEntity.blueprint.defense,
            'is-debuffed': selectedEntity.defense < selectedEntity.blueprint.defense
          }"
        >
          {{ selectedEntity.defense }}
        </span>
        <br />
        Initiative:
        <span
          class="stat"
          :class="{
            'is-buffed': selectedEntity.initiative > selectedEntity.blueprint.initiative,
            'is-debuffed': selectedEntity.initiative < selectedEntity.blueprint.initiative
          }"
        >
          {{ selectedEntity.initiative }}
        </span>
        <br />
        AP: {{ selectedEntity.ap }} / {{ selectedEntity.maxAp }}
        <br />
        Skills
        <dl>
          <template v-for="skill in selectedEntity.blueprint.skills" :key="skill.id">
            <dt>
              {{ skill.name }}
            </dt>
            <dd>{{ skill.description }}</dd>
          </template>
        </dl>
        Passives
        <p v-if="!selectedEntity.triggers.length">No ongoing passives</p>
        <dl>
          <template v-for="trigger in selectedEntity.triggers" :key="trigger.name">
            <dt>
              {{ trigger.name }}
            </dt>
            <dd>{{ trigger.description }}</dd>
          </template>
        </dl>
        Auras
        <p v-if="!selectedEntity.auras.length">No ongoing aura</p>
        <dl>
          <template v-for="aura in selectedEntity.auras" :key="aura.id">
            <dt>
              {{ aura.name }}
            </dt>
            <dd>{{ aura.description }}</dd>
          </template>
        </dl>
      </div>
    </Transition>

    <GameActionBar v-if="!isReplay" class="game-action-bar" />

    <div v-if="!isReplay" class="chat" :class="!isChatDisplayed && 'is-collapsed'">
      <Query
        v-slot="{ data: messages }"
        :query="api => api.games.getGameMessages"
        :args="{ gameId: game._id }"
      >
        <ul v-if="isChatDisplayed">
          <li v-for="message in messages" :key="message._id">
            <span>{{ message.user.name }}</span>
            : {{ message.text }}
          </li>
        </ul>
      </Query>

      <form class="flex gap-3" @submit.prevent="onSubmit">
        <UiIconButton
          type="button"
          icon="game-icons:chat-bubble"
          title="toggle chat"
          @click="isChatDisplayed = !isChatDisplayed"
        />
        <UiTextInput
          v-if="isChatDisplayed"
          id="game-message-input"
          v-model="text"
          placeholder="Send a message"
          :disabled="isReplay"
        />
      </form>
    </div>

    <UiIconButton
      v-if="!isReplay"
      icon="ic:sharp-emoji-flags"
      :theme="{ size: 'font-size-5' }"
      title="Surrender"
      class="surrender-button"
      @click="emit('surrender')"
    />

    <div v-if="isReplay" class="replay-controls" style="--ui-icon-size: var(--size-7)">
      <UiIconButton
        :icon="isPlaying ? 'material-symbols:stop' : 'material-symbols:play-arrow'"
        :title="isPlaying ? 'pause' : 'play'"
        @click="isPlaying = !isPlaying"
      />
      <UiIconButton
        :disabled="isPlaying"
        icon="ion:ios-fastforward"
        title="skip"
        @click="replayStep++"
      />
    </div>
  </div>
</template>

<style scoped>
.game-client-container {
  --primary: var(--yellow-2);
  --color-primary-hsl: var(--yellow-2-hsl);
  --ui-ghost-button-color-hsl: var(--color-primary-hsl);

  --link: var(--primary);

  user-select: none;

  position: relative;

  width: v-bind(width);
  height: v-bind(height);

  font-family: monospace;
  color: var(--gray-0);
}

.player-1 {
  position: absolute;
  top: var(--size-3);
  left: var(--size-5);

  padding: var(--size-3);

  background-color: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);

  img {
    margin-inline: auto;
    border: solid 1px var(--primary);
  }
  [class^='i'] {
    font-size: var(--font-size-4);
    color: var(--green-4);
  }
}
.player-2 {
  position: absolute;
  top: var(--size-3);
  right: var(--size-5);

  padding: var(--size-3);

  text-align: right;

  background-color: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
  img {
    transform: scaleX(-1);
    margin-inline: auto;
    border: solid 1px var(--primary);
  }
  [class^='i'] {
    font-size: var(--font-size-4);
    color: var(--green-4);
  }
}

.player-name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
}

.hp {
  display: flex;
  flex-direction: row-reverse;
  gap: var(--size-1);
  align-items: center;

  font-size: var(--font-size-2);
}
.game-action-bar {
  position: absolute;
  bottom: var(--size-5);
  left: 50%;
  transform: translateX(-50%);
}

.selected-entity {
  position: absolute;
  top: 14rem;
  left: var(--size-5);

  padding: var(--size-4);

  background-color: hsl(0 0% 0% / 0.5);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);

  ul {
    padding-left: var(--size-5);
    list-style-type: disc;
  }

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
.surrender-button {
  position: absolute;
  right: var(--size-4);
  bottom: var(--size-4);
}

.timeline {
  position: absolute;
  top: var(--size-4);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding-inline: var(--size-2);

  background-color: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
  button {
    all: initial;

    aspect-ratio: 1;
    width: 32px;
    padding: 0;

    image-rendering: pixelated;
    &:hover {
      filter: brightness(130%);
    }

    &:first-of-type {
      width: 64px;
    }
  }
}

.global-atb {
  aspect-ratio: 1;
  width: var(--size-7);
  margin-inline: auto;

  background: conic-gradient(
    var(--blue-7) 0deg,
    var(--blue-7) calc(1deg * var(--percent)),
    black calc(1deg * var(--percent))
  );
  background-repeat: no-repeat;
  border: solid var(--border-size-1) var(--primary);
  border-radius: var(--radius-round);
}
.chat {
  position: absolute;
  top: var(--size-15);
  right: var(--size-3);

  padding: var(--size-4);

  color: var(--gray-0);

  background-color: hsl(0 0% 0% / 0.5);
  backdrop-filter: blur(5px);
  border: solid 1px var(--link);
  border-radius: var(--radius-2);

  &:not(.is-collapsed) {
    display: grid;
    grid-template-rows: 1fr auto;
    width: var(--size-14);
    height: var(--size-14);
  }

  ul {
    overflow-y: auto;
    li + li {
      margin-block-start: var(--size-2);
    }

    li > span {
      font-weight: var(--font-weight-6);
      color: var(--primary);
    }
  }

  form {
    color: var(--text-1);
  }
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

.stat.is-buffed {
  color: var(--green-6);
}
.stat.is-debuffed {
  color: var(--red-6);
}

dd,
dt {
  color: inherit;
}
</style>
