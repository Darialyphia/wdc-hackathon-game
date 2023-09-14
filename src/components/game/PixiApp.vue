<script setup lang="ts">
import '../../utils/pixi-custom-elements';
import type { Id } from '../../../convex/_generated/dataModel';
import type { Action, GameDetail } from '../../composables/game/useGame';
import { Application, BaseTexture, SCALE_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import { WRAP_MODES } from 'pixi.js';

import GameContainer from './GameContainer.vue';
import { getSkillById } from '../../game-logic/utils/skill.helper';
import type { Point } from 'pixi.js';
import { api } from '../../api';

const { game, width, height, me } = defineProps<{
  game: GameDetail;
  width: number;
  height: number;
  me: Id<'users'>;
}>();

const emit = defineEmits<{
  action: [Action];
  surrender: [];
}>();

const canvas = ref<HTMLCanvasElement>();

const assets = useAssetsProvider();
const sequencer = useFXSequencerProvider(assets);
const gameState = useGameProvider(
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

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(GameContainer);
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

const { mutate: postMessage, isLoading: isPosting } = useMutation(
  api.games.postMessageToGame
);
const text = ref('');
const onSubmit = async () => {
  await postMessage({ gameId: game._id, text: text.value });
  text.value = '';
};
</script>

<template>
  <div class="game-client-container" @contextmenu.prevent @pointerup="resetTargetMode">
    <canvas ref="canvas" />

    <div class="player-1">
      <img :src="players[0].general?.blueprint.iconUrl" />
      <div class="player-name">{{ players[0].user.name }}</div>

      <div class="hp">
        <div class="i-game-icons:health-normal" />
        {{ players[0].general?.hp }} / {{ players[0].general?.blueprint.maxHp }}
      </div>
    </div>

    <div class="player-2">
      <img :src="players[1].general?.blueprint.iconUrl" />
      <div class="player-name">{{ players[1].user.name }}</div>

      <div class="hp">
        <div class="i-game-icons:health-normal" />
        {{ players[1].general?.hp }} / {{ players[1].general?.blueprint.maxHp }}
      </div>
    </div>

    <div class="timeline">
      <img
        v-for="(entity, index) in gameState.atbTimeline.value"
        :key="index"
        :src="entity.blueprint.iconUrl"
      />
    </div>

    <Transition>
      <div v-if="selectedEntity" class="selected-entity">
        <img :src="selectedEntity.blueprint.iconUrl" />
        {{ selectedEntity.blueprint.name }}
        <br />
        Hp: {{ selectedEntity.hp }} / {{ selectedEntity.blueprint.maxHp }}
        <br />
        Atk:
        {{ selectedEntity.blueprint.attack }}
        <br />
        Def: {{ selectedEntity.blueprint.defense }}
        <br />
        AP: {{ selectedEntity.ap }} / {{ selectedEntity.maxAp }}
        <br />
        Skills
        <ul>
          <li v-for="skill in selectedEntity.blueprint.skills" :key="skill">
            {{ getSkillById(skill)!.name }}
          </li>
        </ul>
      </div>
    </Transition>

    <GameActionBar class="game-action-bar" />

    <div class="chat">
      <Query
        v-slot="{ data: messages }"
        :query="api => api.games.getGameMessages"
        :args="{ gameId: game._id }"
      >
        <ul>
          <li v-for="message in messages" :key="message._id">
            <span>{{ message.user.name }}</span>
            : {{ message.text }}
          </li>
        </ul>
      </Query>

      <form @submit.prevent="onSubmit">
        <UiTextInput
          id="game-message-input"
          v-model="text"
          placeholder="Send a message"
        />
      </form>
    </div>
    <UiIconButton
      icon="ic:sharp-emoji-flags"
      :theme="{ size: 'font-size-5' }"
      title="Surrender"
      class="surrender-button"
      @click="emit('surrender')"
    />
  </div>
</template>

<style scoped>
.game-client-container {
  --link: var(--primary);

  position: relative;

  width: v-bind(width);
  height: v-bind(height);

  font-family: monospace;
  font-size: monospace;
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
  img {
    aspect-ratio: 1;
    width: 32px;
    image-rendering: pixelated;

    &:first-of-type {
      width: 64px;
    }
  }
}

.chat {
  position: absolute;
  top: var(--size-15);
  right: var(--size-3);

  display: grid;
  grid-template-rows: 1fr auto;

  width: var(--size-14);
  height: var(--size-14);
  padding: var(--size-4);

  color: var(--gray-0);

  background-color: hsl(0 0% 0% / 0.5);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-2);

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
</style>
