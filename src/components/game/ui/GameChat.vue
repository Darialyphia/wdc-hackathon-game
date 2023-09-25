<script setup lang="ts">
import { api } from '../../../api';

const { game } = useGame();

const { mutate: postMessage } = useMutation(api.games.postMessageToGame);
const text = ref('');
const onSubmit = async () => {
  await postMessage({ gameId: game.value._id, text: text.value });
  text.value = '';
};

const isChatDisplayed = ref(false);
</script>

<template>
  <div class="chat fancy-surface" :class="!isChatDisplayed && 'is-collapsed'">
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
      />
    </form>
  </div>
</template>

<style scoped>
.chat {
  position: absolute;
  top: var(--size-15);
  right: var(--size-3);

  padding: var(--size-4);

  color: var(--gray-0);

  backdrop-filter: blur(5px);
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
</style>
